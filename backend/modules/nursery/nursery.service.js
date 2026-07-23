const admin = require('../../config/firebase');

const db = admin.firestore();

// ============================================================
// COLLECTION REFERENCES
// ============================================================
const NURSERIES_COL = 'nurseries';
const PLANTS_COL = 'plants';
const ORDERS_COL = 'orders';

// ============================================================
// HELPERS
// ============================================================

/** Haversine distance in KM */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Convert a Firestore snapshot to a plain object with `id` */
const snapToObj = (snap) => ({ id: snap.id, ...snap.data() });

/** Generate a readable order ID: ORD-YYYYMMDD-XXXXX */
function generateOrderId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${date}-${rand}`;
}

// ============================================================
// NURSERY PROFILE
// ============================================================

/** Create a new nursery profile (registration) */
exports.registerNursery = async (data) => {
  const { userId, nurseryName, ownerName, phone, email, latitude, longitude, address, openingTime, closingTime, licenseNumber } = data;

  const docRef = db.collection(NURSERIES_COL).doc(userId);
  const existing = await docRef.get();
  if (existing.exists) {
    throw new Error('Nursery profile already exists for this user');
  }

  const nursery = {
    userId,
    nurseryName,
    ownerName,
    phone: phone || '',
    email: email || '',
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
    address: address || '',
    openingTime: openingTime || '',
    closingTime: closingTime || '',
    licenseNumber: licenseNumber || '',
    status: 'pending', // pending → approved → active / rejected
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await docRef.set(nursery);
  return { id: userId, ...nursery, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
};

/** Get nursery profile by userId */
exports.getProfileByUserId = async (userId) => {
  const doc = await db.collection(NURSERIES_COL).doc(userId).get();
  if (!doc.exists) return null;
  return snapToObj(doc);
};

/** Update nursery profile */
exports.updateProfile = async (userId, data) => {
  const updates = { ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
  // Remove undefined / null fields
  Object.keys(updates).forEach((k) => {
    if (updates[k] === undefined || updates[k] === null) delete updates[k];
  });
  await db.collection(NURSERIES_COL).doc(userId).update(updates);
  const updated = await db.collection(NURSERIES_COL).doc(userId).get();
  return snapToObj(updated);
};

// ============================================================
// PLANTS (inventory)
// ============================================================

/** Add a plant to a nursery's inventory */
exports.addPlant = async (data) => {
  const { nurseryId, plantName, category, price, quantity, imageUrl, description } = data;
  const docRef = db.collection(PLANTS_COL).doc();
  const plant = {
    nurseryId,
    plantName,
    category: category || '',
    price: parseFloat(price) || 0,
    quantity: parseInt(quantity, 10) || 0,
    imageUrl: imageUrl || '',
    description: description || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await docRef.set(plant);
  return { id: docRef.id, ...plant, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
};

/** Get all plants for a nursery */
exports.getNurseryPlants = async (nurseryId) => {
  const snapshot = await db
    .collection(PLANTS_COL)
    .where('nurseryId', '==', nurseryId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(snapToObj);
};

/** Update a plant */
exports.updatePlant = async (plantId, nurseryId, data) => {
  const docRef = db.collection(PLANTS_COL).doc(plantId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Plant not found');
  if (doc.data().nurseryId !== nurseryId) throw new Error('Not authorized — plant belongs to another nursery');

  const updates = { ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
  Object.keys(updates).forEach((k) => {
    if (updates[k] === undefined || updates[k] === null) delete updates[k];
  });
  await docRef.update(updates);
  const updated = await docRef.get();
  return snapToObj(updated);
};

/** Delete a plant */
exports.deletePlant = async (plantId, nurseryId) => {
  const docRef = db.collection(PLANTS_COL).doc(plantId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Plant not found');
  if (doc.data().nurseryId !== nurseryId) throw new Error('Not authorized — plant belongs to another nursery');
  await docRef.delete();
  return { message: 'Plant deleted' };
};

// ============================================================
// SEARCH
// ============================================================

/** Search plants across all active nurseries */
exports.searchPlants = async ({ query, lat, lng }) => {
  // Fetch all active nurseries
  const nurseriesSnap = await db
    .collection(NURSERIES_COL)
    .where('status', '==', 'active')
    .get();

  if (nurseriesSnap.empty) return [];

  const activeNurseryIds = new Set();
  const nurseryMap = {};
  nurseriesSnap.docs.forEach((doc) => {
    const data = doc.data();
    activeNurseryIds.add(doc.id);
    nurseryMap[doc.id] = data;
  });

  // Build the plant query
  let plantsQuery = db.collection(PLANTS_COL).where('quantity', '>', 0);

  if (query && query.trim()) {
    // Firestore doesn't support ILIKE natively, so we fetch & filter in-memory
    // For large datasets, consider Algolia/MeiliSearch. For now, fetch and filter.
  }

  const plantsSnap = await plantsQuery.get();
  let results = [];

  plantsSnap.docs.forEach((doc) => {
    const plant = snapToObj(doc);
    // Filter by nursery active
    if (!activeNurseryIds.has(plant.nurseryId)) return;
    // Filter by query (case-insensitive in-memory)
    if (query && query.trim()) {
      const q = query.toLowerCase();
      const nameMatch = plant.plantName?.toLowerCase().includes(q);
      const catMatch = plant.category?.toLowerCase().includes(q);
      if (!nameMatch && !catMatch) return;
    }

    const nursery = nurseryMap[plant.nurseryId];
    const row = {
      plantId: plant.id,
      plantName: plant.plantName,
      category: plant.category,
      price: plant.price,
      quantity: plant.quantity,
      description: plant.description,
      imageUrl: plant.imageUrl,
      nurseryId: plant.nurseryId,
      nurseryName: nursery?.nurseryName || '',
      ownerName: nursery?.ownerName || '',
      phone: nursery?.phone || '',
      email: nursery?.email || '',
      address: nursery?.address || '',
      latitude: nursery?.latitude || null,
      longitude: nursery?.longitude || null,
      openingTime: nursery?.openingTime || '',
      closingTime: nursery?.closingTime || '',
      status: nursery?.status || '',
    };

    // Compute distance if lat/lng provided
    if (lat && lng && row.latitude && row.longitude) {
      row.distance_km = haversine(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(row.latitude),
        parseFloat(row.longitude)
      );
    } else {
      row.distance_km = null;
    }

    results.push(row);
  });

  // Sort by distance if available
  if (lat && lng) {
    results.sort((a, b) => (a.distance_km || 99999) - (b.distance_km || 99999));
  }

  return results;
};

/** Get a single nursery detail with its plants */
exports.getNurseryDetail = async (nurseryId) => {
  const doc = await db.collection(NURSERIES_COL).doc(nurseryId).get();
  if (!doc.exists) return null;
  const nursery = snapToObj(doc);
  const plants = await exports.getNurseryPlants(nurseryId);
  return { ...nursery, plants };
};

// ============================================================
// ORDERS
// ============================================================

/** Create a new order (with stock validation & decrement) */
exports.createOrder = async ({ farmerId, nurseryId, items, fulfillmentType }) => {
  // Use Firestore runTransaction for atomicity
  const orderRef = db.collection(ORDERS_COL).doc();

  await db.runTransaction(async (transaction) => {
    let total = 0;

    for (const item of items) {
      const plantRef = db.collection(PLANTS_COL).doc(item.plantId);
      const plantDoc = await transaction.get(plantRef);

      if (!plantDoc.exists) {
        throw new Error(`Plant ${item.plantId} not found`);
      }

      const plant = plantDoc.data();

      if (plant.nurseryId !== nurseryId) {
        throw new Error(`Plant ${item.plantId} does not belong to this nursery`);
      }

      if (plant.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${plant.plantName}. Available: ${plant.quantity}`);
      }

      total += parseFloat(plant.price) * item.quantity;

      // Decrement stock
      transaction.update(plantRef, { quantity: plant.quantity - item.quantity });
    }

    // Create order with embedded items
    const order = {
      orderId: generateOrderId(),
      farmerId,
      nurseryId,
      total,
      status: 'pending',
      fulfillmentType: fulfillmentType || 'pickup',
      items: items.map((item) => ({
        plantId: item.plantId,
        quantity: item.quantity,
      })),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    transaction.set(orderRef, order);
  });

  // Fetch and return the full order with plant names populated
  const orderSnap = await orderRef.get();
  const order = snapToObj(orderSnap);

  // Populate plant names
  const populatedItems = [];
  for (const item of order.items || []) {
    const plantDoc = await db.collection(PLANTS_COL).doc(item.plantId).get();
    const plant = plantDoc.data();
    populatedItems.push({
      plantId: item.plantId,
      plantName: plant?.plantName || 'Unknown',
      price: plant?.price || 0,
      quantity: item.quantity,
    });
  }
  order.items = populatedItems;

  return order;
};

/** Get farmer's orders */
exports.getFarmerOrders = async (farmerId) => {
  const snapshot = await db
    .collection(ORDERS_COL)
    .where('farmerId', '==', farmerId)
    .orderBy('createdAt', 'desc')
    .get();

  const orders = [];
  for (const doc of snapshot.docs) {
    const order = snapToObj(doc);
    // Populate nursery name
    const nurseryDoc = await db.collection(NURSERIES_COL).doc(order.nurseryId).get();
    const nursery = nurseryDoc.data();
    order.nurseryName = nursery?.nurseryName || 'Unknown';

    // Populate item details
    const populatedItems = [];
    for (const item of order.items || []) {
      const plantDoc = await db.collection(PLANTS_COL).doc(item.plantId).get();
      const plant = plantDoc.data();
      populatedItems.push({
        plantId: item.plantId,
        plantName: plant?.plantName || 'Unknown',
        price: plant?.price || 0,
        quantity: item.quantity,
      });
    }
    order.items = populatedItems;
    orders.push(order);
  }

  return orders;
};

/** Get nursery's incoming orders */
exports.getNurseryOrders = async (nurseryId) => {
  const snapshot = await db
    .collection(ORDERS_COL)
    .where('nurseryId', '==', nurseryId)
    .orderBy('createdAt', 'desc')
    .get();

  const orders = [];
  for (const doc of snapshot.docs) {
    const order = snapToObj(doc);

    // Get farmer info from Firebase Auth
    let farmerName = 'Unknown';
    let farmerEmail = '';
    try {
      const userRecord = await admin.auth().getUser(order.farmerId);
      farmerName = userRecord.displayName || userRecord.email || 'Unknown';
      farmerEmail = userRecord.email || '';
    } catch {
      // farmer not found in auth — that's ok
    }

    order.farmerName = farmerName;
    order.farmerEmail = farmerEmail;

    // Populate item details
    const populatedItems = [];
    for (const item of order.items || []) {
      const plantDoc = await db.collection(PLANTS_COL).doc(item.plantId).get();
      const plant = plantDoc.data();
      populatedItems.push({
        plantId: item.plantId,
        plantName: plant?.plantName || 'Unknown',
        price: plant?.price || 0,
        quantity: item.quantity,
      });
    }
    order.items = populatedItems;
    orders.push(order);
  }

  return orders;
};

/** Update order status (with stock restore on cancel/reject) */
exports.updateOrderStatus = async (orderId, nurseryId, status) => {
  const orderRef = db.collection(ORDERS_COL).doc(orderId);

  await db.runTransaction(async (transaction) => {
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists) throw new Error('Order not found');
    const order = orderDoc.data();

    if (order.nurseryId !== nurseryId) {
      throw new Error('Order not associated with this nursery');
    }

    // If cancelling/rejecting a pending order, restore stock
    if (
      (status === 'cancelled' || status === 'rejected') &&
      order.status === 'pending'
    ) {
      for (const item of order.items || []) {
        const plantRef = db.collection(PLANTS_COL).doc(item.plantId);
        const plantDoc = await transaction.get(plantRef);
        if (plantDoc.exists) {
          const plant = plantDoc.data();
          transaction.update(plantRef, {
            quantity: (plant.quantity || 0) + item.quantity,
          });
        }
      }
    }

    transaction.update(orderRef, {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  const updated = await orderRef.get();
  return snapToObj(updated);
};

// ============================================================
// DASHBOARD
// ============================================================

/** Get nursery dashboard summary */
exports.getDashboardSummary = async (nurseryId) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const ordersSnap = await db
    .collection(ORDERS_COL)
    .where('nurseryId', '==', nurseryId)
    .get();

  const plantsSnap = await db
    .collection(PLANTS_COL)
    .where('nurseryId', '==', nurseryId)
    .get();

  let pendingCount = 0;
  let completedCount = 0;
  let revenueTotal = 0;
  let todaysOrdersCount = 0;

  ordersSnap.docs.forEach((doc) => {
    const order = doc.data();
    if (order.status === 'pending') pendingCount++;
    if (order.status === 'completed') {
      completedCount++;
      revenueTotal += parseFloat(order.total) || 0;
    }
    // Check if created today
    if (order.createdAt) {
      const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      if (orderDate >= todayStart) {
        todaysOrdersCount++;
      }
    }
  });

  return {
    todays_orders_count: todaysOrdersCount,
    pending_count: pendingCount,
    completed_count: completedCount,
    plants_available_count: plantsSnap.size,
    revenue_total: revenueTotal,
  };
};


const admin = require('../../config/firebase');

const db = admin.firestore();

// ============================================================
// COLLECTION REFERENCES
// ============================================================
const NURSERIES_COL = 'nurseries';
const CROPS_COL = 'crops';
const PLANTS_COL = 'crops'; // legacy alias — plants stored in crops collection
const ORDERS_COL = 'orders';
const CATEGORIES_COL = 'cropCategories';
const REVIEWS_COL = 'reviews';
const WISHLIST_COL = 'wishlist';
const NOTIFICATIONS_COL = 'notifications';
const MESSAGES_COL = 'messages';
const RECOMMENDATIONS_COL = 'recommendations';

// Cache for categories (avoid repeated reads)
let categoriesCache = null;
let categoriesCacheTime = 0;
const CATEGORY_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// ============================================================
// HELPERS
// ============================================================

/** Haversine distance in KM */
function haversine(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;
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

/** Normalize a string for matching (lowercase, trim) */
const norm = (s) => (s || '').toString().toLowerCase().trim();

/** Determine if a nursery is currently open based on opening/closing hours */
function isOpenNow(nursery) {
  if (!nursery || !nursery.openingTime || !nursery.closingTime) return false;
  const now = new Date();
  const hour = now.getHours();
  const openH = parseInt(nursery.openingTime.split(':')[0], 10);
  const closeH = parseInt(nursery.closingTime.split(':')[0], 10);
  if (isNaN(openH) || isNaN(closeH)) return false;
  return hour >= openH && hour < closeH;
}

/** Compute distance_km for a nursery given user location, and attach open_now */
function decorateNursery(nursery, lat, lng) {
  const n = { ...nursery };
  n.distance_km = haversine(lat, lng, n.latitude, n.longitude);
  n.open_now = isOpenNow(n);
  return n;
}

/** Build a crop row with nursery info + distance */
function decorateCrop(crop, nursery, lat, lng) {
  const c = { ...crop, plantId: crop.id || crop.plantId };
  if (nursery) {
    c.nurseryName = c.nurseryName || nursery.nurseryName;
    c.nurseryRating = c.nurseryRating || nursery.rating;
    c.nurseryPhone = c.nurseryPhone || nursery.phone;
    c.nurseryAddress = c.nurseryAddress || nursery.address;
    c.nurseryImage = c.nurseryImage || nursery.logo;
    c.latitude = c.latitude || nursery.latitude;
    c.longitude = c.longitude || nursery.longitude;
  }
  c.distance_km = haversine(lat, lng, c.latitude, c.longitude);
  return c;
}

/** Intent detection: classify a search query into location / crop / nursery / mixed */
function detectIntent(query) {
  const q = norm(query);
  if (!q) return { type: 'general', terms: [] };

  const LOCATION_KEYWORDS = [
    'kuppam', 'chittoor', 'tirupati', 'madnapalle', 'palamaner', 'punganur',
    'kadapa', 'anantapur', 'andhra', 'village', 'town', 'district', 'nearby', 'near me',
  ];

  const NURSERY_KEYWORDS = ['nursery', 'gardens', 'farm', 'nurseries', 'store', 'shop'];

  const words = q.split(/\s+/);
  const locationMatches = words.filter((w) => LOCATION_KEYWORDS.includes(w) || w.length > 6);
  const nurseryMatches = words.filter((w) => NURSERY_KEYWORDS.includes(w));

  // If query contains a known district/city name
  const hasLocation = LOCATION_KEYWORDS.some((k) => q.includes(k));
  const hasNurseryWord = NURSERY_KEYWORDS.some((k) => q.includes(k));

  if (hasLocation && hasNurseryWord) return { type: 'location', terms: words.filter((w) => !NURSERY_KEYWORDS.includes(w)) };
  if (hasLocation) {
    // Could be location + crop (e.g. "Kuppam Tomato")
    const cropTerms = words.filter((w) => !LOCATION_KEYWORDS.includes(w) && w.length > 2);
    if (cropTerms.length > 0) return { type: 'location_crop', location: q, cropTerms };
    return { type: 'location', terms: words };
  }
  if (hasNurseryWord) return { type: 'nursery', terms: words };
  return { type: 'crop', terms: words };
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
    status: 'pending',
    verified: false,
    featured: false,
    deliveryAvailable: false,
    pickupAvailable: true,
    rating: 0,
    followers: 0,
    cropCount: 0,
    gallery: [],
    about: '',
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
  Object.keys(updates).forEach((k) => {
    if (updates[k] === undefined || updates[k] === null) delete updates[k];
  });
  await db.collection(NURSERIES_COL).doc(userId).update(updates);
  const updated = await db.collection(NURSERIES_COL).doc(userId).get();
  return snapToObj(updated);
};

/** Extended profile update (owner) — rich fields */
exports.updateNurseryProfile = async (nurseryId, data) => {
  const allowed = [
    'about', 'gallery', 'deliveryAvailable', 'pickupAvailable', 'organicCertified',
    'govtApproved', 'parking', 'openDays', 'logo', 'coverImage', 'categories',
    'address', 'phone', 'email', 'openingTime', 'closingTime', 'latitude', 'longitude',
  ];
  const updates = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
  Object.entries(data || {}).forEach(([key, val]) => {
    if (allowed.includes(key) && val !== undefined && val !== null) updates[key] = val;
  });
  if ('latitude' in updates) updates.latitude = parseFloat(updates.latitude);
  if ('longitude' in updates) updates.longitude = parseFloat(updates.longitude);
  await db.collection(NURSERIES_COL).doc(nurseryId).update(updates);
  const updated = await db.collection(NURSERIES_COL).doc(nurseryId).get();
  return snapToObj(updated);
};

// ============================================================
// CROPS / PLANTS (inventory)
// ============================================================

/** Add a crop/plant to a nursery's inventory */
exports.addPlant = async (data) => {
  const { nurseryId, plantName, category, price, quantity, imageUrl, description } = data;
  const docRef = db.collection(CROPS_COL).doc();
  const plant = {
    nurseryId,
    plantName,
    category: category || '',
    price: parseFloat(price) || 0,
    quantity: parseInt(quantity, 10) || 0,
    imageUrl: imageUrl || '',
    description: description || '',
    nurseryName: '',
    rating: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // attach nursery name
  const nurseryDoc = await db.collection(NURSERIES_COL).doc(nurseryId).get();
  if (nurseryDoc.exists) plant.nurseryName = nurseryDoc.data().nurseryName || '';

  await docRef.set(plant);
  await exports.incrementCropCount(nurseryId, 1);
  return { id: docRef.id, plantId: docRef.id, ...plant, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
};

/** Add a full featured crop (owner) */
exports.addCrop = async (data) => {
  const { nurseryId } = data;
  const docRef = db.collection(CROPS_COL).doc();
  const crop = {
    nurseryId,
    plantName: data.plantName || data.scientificName || '',
    plantId: docRef.id,
    category: data.category || 'Vegetables',
    variety: data.variety || '',
    description: data.description || '',
    price: parseFloat(data.price) || 0,
    quantity: parseInt(data.quantity, 10) || 0,
    imageUrl: data.imageUrl || (data.images && data.images[0]) || '',
    images: data.images || [],
    organic: !!data.organic,
    deliveryAvailable: !!data.deliveryAvailable,
    plantAge: data.plantAge || 0,
    plantAgeUnit: data.plantAgeUnit || 'months',
    height: data.height || 0,
    waterRequirement: data.waterRequirement || '',
    sunlightRequirement: data.sunlightRequirement || '',
    growingSeason: data.growingSeason || '',
    expectedYield: data.expectedYield || '',
    diseaseResistance: data.diseaseResistance || 90,
    minOrder: parseInt(data.minOrder, 10) || 1,
    maxOrder: parseInt(data.maxOrder, 10) || 500,
    readyDate: data.readyDate || '',
    rating: 0,
    healthy: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const nurseryDoc = await db.collection(NURSERIES_COL).doc(nurseryId).get();
  if (nurseryDoc.exists) {
    const n = nurseryDoc.data();
    crop.nurseryName = n.nurseryName || '';
    crop.nurseryRating = n.rating || 0;
    crop.nurseryPhone = n.phone || '';
    crop.nurseryAddress = n.address || '';
    crop.nurseryImage = n.logo || '';
    crop.latitude = n.latitude || null;
    crop.longitude = n.longitude || null;
  }

  await docRef.set(crop);
  await exports.incrementCropCount(nurseryId, 1);
  return { id: docRef.id, ...crop };
};

/** Increment or decrement a nursery's crop count */
exports.incrementCropCount = async (nurseryId, delta) => {
  const ref = db.collection(NURSERIES_COL).doc(nurseryId);
  const doc = await ref.get();
  if (doc.exists) {
    const current = doc.data().cropCount || 0;
    await ref.update({ cropCount: Math.max(0, current + delta) });
  }
};

/** Get all crops for a nursery */
exports.getNurseryPlants = async (nurseryId) => {
  const snapshot = await db
    .collection(CROPS_COL)
    .where('nurseryId', '==', nurseryId)
    .limit(200)
    .get();
  return snapshot.docs.map((d) => ({ ...snapToObj(d), plantId: d.id }));
};

/** Update a crop/plant */
exports.updatePlant = async (plantId, nurseryId, data) => {
  const docRef = db.collection(CROPS_COL).doc(plantId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Plant not found');
  if (doc.data().nurseryId !== nurseryId) throw new Error('Not authorized — plant belongs to another nursery');

  const updates = { ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
  if (updates.plantId) delete updates.plantId;
  Object.keys(updates).forEach((k) => {
    if (updates[k] === undefined || updates[k] === null) delete updates[k];
  });
  await docRef.update(updates);
  const updated = await docRef.get();
  return { ...snapToObj(updated), plantId: updated.id };
};

/** Delete a crop/plant */
exports.deletePlant = async (plantId, nurseryId) => {
  const docRef = db.collection(CROPS_COL).doc(plantId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Plant not found');
  if (doc.data().nurseryId !== nurseryId) throw new Error('Not authorized — plant belongs to another nursery');
  await docRef.delete();
  await exports.incrementCropCount(nurseryId, -1);
  return { message: 'Plant deleted' };
};

// ============================================================
// CATEGORIES
// ============================================================

/** Get list of crop categories */
exports.getCropCategories = async () => {
  if (categoriesCache && Date.now() - categoriesCacheTime < CATEGORY_CACHE_TTL) {
    return categoriesCache;
  }
  const snapshot = await db.collection(CATEGORIES_COL).orderBy('order', 'asc').get();
  let cats;
  if (snapshot.empty) {
    // Fallback default categories
    cats = [
      'Vegetables', 'Fruit Plants', 'Flower Plants', 'Medicinal Plants',
      'Forest', 'Shade Plants', 'Indoor Plants', 'Outdoor Plants',
      'Seeds', 'Saplings', 'Organic Plants',
    ].map((name, i) => ({ id: `cat_${i}`, name, icon: '🌱', order: i }));
  } else {
    cats = snapshot.docs.map(snapToObj);
  }
  categoriesCache = cats;
  categoriesCacheTime = Date.now();
  return cats;
};

/** Get crops by category */
exports.getCropsByCategory = async ({ category, lat, lng }) => {
  let query = db.collection(CROPS_COL).where('quantity', '>', 0);
  if (category && category !== 'Nearby' && category !== 'All' && category !== 'offers') {
    query = query.where('category', '==', category);
  }
  const snapshot = await query.limit(200).get();
  const results = [];
  for (const doc of snapshot.docs) {
    const crop = snapToObj(doc);
    const nurseryDoc = await db.collection(NURSERIES_COL).doc(crop.nurseryId).get();
    const nursery = nurseryDoc.exists ? nurseryDoc.data() : null;
    if (nursery && nursery.status !== 'active') continue;
    results.push(decorateCrop(crop, nursery, lat, lng));
  }
  // Sort by distance
  if (lat && lng) results.sort((a, b) => (a.distance_km || 99999) - (b.distance_km || 99999));
  return results;
};

// ============================================================
// SMART SEARCH
// ============================================================

/**
 * Unified smart search — detects location / crop / nursery intent.
 * Returns categorized results (crops first, then nurseries) like Amazon.
 */
exports.executeSearch = async ({ query, lat, lng, filters = {} }) => {
  const q = norm(query);
  const intent = detectIntent(query);

  // Fetch active nurseries
  const nurserySnap = await db.collection(NURSERIES_COL).where('status', '==', 'active').get();
  const nurseries = nurserySnap.docs.map((doc) => {
    const n = snapToObj(doc);
    return decorateNursery(n, lat, lng);
  });

  // Location filter — if intent is location, restrict to that city/district
  let scopedNurseries = nurseries;
  if (intent.type === 'location' || intent.type === 'location_crop') {
    const locStr = norm(intent.location || query);
    scopedNurseries = nurseries.filter((n) =>
      norm(n.city).includes(locStr) ||
      norm(n.district).includes(locStr) ||
      norm(n.address).includes(locStr)
    );
    // If no exact match, fall back to all (e.g. "nearby")
    if (scopedNurseries.length === 0 && !LOCATION_ONLY(intent)) scopedNurseries = nurseries;
  }

  // Apply filters
  const filteredNurseries = scopedNurseries.filter((n) =>
    applyNurseryFilters(n, filters)
  );

  // Fetch crops belonging to scoped nurseries
  const scopedIds = new Set(filteredNurseries.map((n) => n.id));
  const cropSnap = await db.collection(CROPS_COL).where('quantity', '>', 0).limit(500).get();

  let matchingCrops = [];
  let matchingNurseries = [];

  if (intent.type === 'nursery') {
    // Match nursery by name
    const nameTerms = intent.terms.filter((t) => t !== 'nursery' && t !== 'nurseries');
    matchingNurseries = filteredNurseries.filter((n) => {
      const name = norm(n.nurseryName);
      return nameTerms.every((t) => name.includes(t)) || norm(n.nurseryName).includes(q);
    });
    // Include their crops
    const matchedIds = new Set(matchingNurseries.map((n) => n.id));
    for (const doc of cropSnap.docs) {
      const crop = snapToObj(doc);
      if (matchedIds.has(crop.nurseryId)) {
        matchingCrops.push(decorateCrop(crop, findNursery(matchingNurseries, crop.nurseryId), lat, lng));
      }
    }
  } else {
    // Crop + location matching
    const cropTerms = intent.cropTerms || intent.terms || [q];
    for (const doc of cropSnap.docs) {
      const crop = snapToObj(doc);
      if (!scopedIds.has(crop.nurseryId)) continue;
      const nursery = findNursery(filteredNurseries, crop.nurseryId);
      const cropMatch = matchesCropQuery(crop, cropTerms, intent);
      if (cropMatch) {
        matchingCrops.push(decorateCrop(crop, nursery, lat, lng));
      }
    }

    // Related nurseries = those that have matching crops OR match location
    const cropNurseryIds = new Set(matchingCrops.map((c) => c.nurseryId));
    matchingNurseries = filteredNurseries.filter((n) => {
      if (cropNurseryIds.has(n.id)) return true;
      if (intent.type === 'location') return true;
      return norm(n.nurseryName).includes(q);
    });
  }

  // Sort crops by distance, nurseries by distance
  if (lat && lng) {
    matchingCrops.sort((a, b) => (a.distance_km || 99999) - (b.distance_km || 99999));
    matchingNurseries.sort((a, b) => (a.distance_km || 99999) - (b.distance_km || 99999));
  }

  // Limit results
  matchingCrops = matchingCrops.slice(0, 30);
  matchingNurseries = matchingNurseries.slice(0, 30);

  return {
    query: query || '',
    intent: {
      type: intent.type,
      originalQuery: query || '',
      detectedLocation: intent.location || (intent.type === 'location' ? query : null),
    },
    totalNurseries: matchingNurseries.length,
    totalCrops: matchingCrops.length,
    crops: matchingCrops,
    nurseries: matchingNurseries,
    totalResults: matchingCrops.length + matchingNurseries.length,
    filters: {
      distance: filters.distance || null,
      categories: filters.categories || [],
      rating: filters.rating || null,
      delivery: !!filters.delivery,
      pickup: !!filters.pickup,
      openNow: !!filters.openNow,
      organic: !!filters.organic,
      inStock: !!filters.inStock,
    },
  };
};

function LOCATION_ONLY(intent) {
  return intent.type === 'location' && !intent.cropTerms;
}

function matchesCropQuery(crop, terms, intent) {
  if (terms.length === 0) {
    // If just location, all crops match
    return intent.type === 'location';
  }
  const name = norm(crop.plantName);
  const cat = norm(crop.category);
  const sci = norm(crop.scientificName);
  const variety = norm(crop.variety);
  return terms.some((t) =>
    name.includes(t) || cat.includes(t) || sci.includes(t) || variety.includes(t) || t.includes(norm(crop.plantName))
  );
}

function findNursery(nurseries, id) {
  return nurseries.find((n) => n.id === id) || null;
}

function applyNurseryFilters(nursery, filters) {
  if (!filters) return true;
  if (filters.distance && nursery.distance_km != null && nursery.distance_km > filters.distance) return false;
  if (filters.rating && (nursery.rating || 0) < filters.rating) return false;
  if (filters.delivery && !nursery.deliveryAvailable) return false;
  if (filters.pickup && !nursery.pickupAvailable) return false;
  if (filters.openNow && !isOpenNow(nursery)) return false;
  if (filters.organic && !nursery.organicCertified) return false;
  if (filters.categories && filters.categories.length > 0) return true; // crop-level filter handled separately
  return true;
}

/** Alias for smart-search endpoint */
exports.smartSearch = async ({ query, lat, lng }) => {
  return exports.executeSearch({ query, lat, lng });
};

/** Live search suggestions (categorized) */
exports.getSearchSuggestions = async ({ query, lat, lng }) => {
  const q = norm(query);
  const result = { locations: [], nurseries: [], crops: [] };
  if (!q) return result;

  // Locations
  const LOCS = [
    { name: 'Kuppam', district: 'Chittoor' },
    { name: 'Chittoor', district: 'Chittoor' },
    { name: 'Tirupati', district: 'Tirupati' },
    { name: 'Madanapalle', district: 'Annamayya' },
    { name: 'Palamaner', district: 'Chittoor' },
    { name: 'Punganur', district: 'Chittoor' },
    { name: 'Kadapa', district: 'YSR Kadapa' },
    { name: 'Anantapur', district: 'Anantapur' },
  ];
  result.locations = LOCS.filter((l) => norm(l.name).includes(q)).slice(0, 4);

  // Nurseries
  const nurserySnap = await db.collection(NURSERIES_COL).where('status', '==', 'active').limit(100).get();
  const nurseries = nurserySnap.docs.map((doc) => {
    const n = snapToObj(doc);
    return { ...decorateNursery(n, lat, lng), matchName: norm(n.nurseryName) };
  });
  result.nurseries = nurseries
    .filter((n) => n.matchName.includes(q))
    .slice(0, 4)
    .map((n) => ({ id: n.id, name: n.nurseryName, address: n.address, distance_km: n.distance_km }));

  // Crops
  const cropSnap = await db.collection(CROPS_COL).where('quantity', '>', 0).limit(200).get();
  const seen = new Set();
  for (const doc of cropSnap.docs) {
    const crop = snapToObj(doc);
    if (seen.has(crop.plantName)) continue;
    if (norm(crop.plantName).includes(q) || norm(crop.category).includes(q)) {
      const nurseryDoc = await db.collection(NURSERIES_COL).doc(crop.nurseryId).get();
      const nursery = nurseryDoc.exists ? nurseryDoc.data() : {};
      seen.add(crop.plantName);
      result.crops.push({
        plantId: crop.id || crop.plantId,
        plantName: crop.plantName,
        category: crop.category,
        price: crop.price,
        nurseryName: crop.nurseryName || nursery.nurseryName || '',
        distance_km: haversine(lat, lng, crop.latitude, crop.longitude),
      });
      if (result.crops.length >= 4) break;
    }
  }

  return result;
};

// ============================================================
// HOME FEED
// ============================================================

/** Marketplace home feed */
exports.getHomeFeed = async ({ lat, lng, userId }) => {
  const nurserySnap = await db.collection(NURSERIES_COL).where('status', '==', 'active').limit(100).get();
  const nurseries = nurserySnap.docs.map((doc) => decorateNursery(snapToObj(doc), lat, lng));

  // Sorted by distance for nearby
  const nearby = [...nurseries].sort((a, b) => (a.distance_km || 99999) - (b.distance_km || 99999)).slice(0, 10);
  const featured = nurseries.filter((n) => n.featured).slice(0, 10);
  const topRated = [...nurseries].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);

  // Popular crops (group by count of same name)
  const cropSnap = await db.collection(CROPS_COL).where('quantity', '>', 0).limit(300).get();
  const cropFreq = {};
  const cropMap = {};
  for (const doc of cropSnap.docs) {
    const crop = snapToObj(doc);
    if (!crop.plantName) continue;
    cropFreq[crop.plantName] = (cropFreq[crop.plantName] || 0) + 1;
    if (!cropMap[crop.plantName]) cropMap[crop.plantName] = crop;
  }
  const popularCropNames = Object.entries(cropFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name);

  const popularCrops = [];
  for (const name of popularCropNames) {
    const crop = cropMap[name];
    const nurseryDoc = await db.collection(NURSERIES_COL).doc(crop.nurseryId).get();
    const nursery = nurseryDoc.exists ? nurseryDoc.data() : null;
    popularCrops.push(decorateCrop(crop, nursery, lat, lng));
  }

  // Recommended, recently viewed, trending, seasonal
  const recommendedForYou = popularCrops.slice(0, 6);
  const trending = [...popularCrops].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
  const recentlyAdded = cropSnap.docs.slice(0, 6).map((doc) => {
    const crop = snapToObj(doc);
    return decorateCrop(crop, null, lat, lng);
  });
  const recentlyViewed = nurseries.slice(0, 6);
  const seasonal = popularCrops.slice(0, 6);

  return {
    nearbyNurseries: nearby,
    featuredNurseries: featured,
    topRatedNurseries: topRated,
    popularCrops,
    trendingCrops: trending,
    seasonalRecommendations: seasonal,
    recommendedForYou,
    recentlyAdded,
    recentlyViewed,
    offers: [
      {
        id: 'offer_1',
        title: 'Flat 20% off on Fruit Plants',
        description: 'Limited period offer on all fruit plant seedlings.',
        icon: '🥭',
      },
      {
        id: 'offer_2',
        title: 'Buy 2 Get 1 Free on Seeds',
        description: 'On all vegetable seeds this week.',
        icon: '🌱',
      },
    ],
  };
};

// ============================================================
// CROP DETAILS
// ============================================================

/** Get full crop details with nursery + similar crops */
exports.getCropDetails = async (cropId) => {
  const doc = await db.collection(CROPS_COL).doc(cropId).get();
  if (!doc.exists) return null;
  const crop = snapToObj(doc);

  const nurseryDoc = await db.collection(NURSERIES_COL).doc(crop.nurseryId).get();
  const nursery = nurseryDoc.exists ? nurseryDoc.data() : {};

  const result = {
    ...crop,
    plantId: crop.id || crop.plantId,
    nurseryName: crop.nurseryName || nursery.nurseryName,
    nurseryRating: crop.nurseryRating || nursery.rating,
    nurseryId: crop.nurseryId,
    nurseryImage: crop.nurseryImage || nursery.logo || nursery.imageUrl,
    nurseryPhone: crop.nurseryPhone || nursery.phone,
    nurseryAddress: crop.nurseryAddress || nursery.address,
    longitude: crop.longitude || nursery.longitude,
    latitude: crop.latitude || nursery.latitude,
  };

  // Similar crops (same category)
  let similar = [];
  try {
    const similarSnap = await db.collection(CROPS_COL).where('category', '==', crop.category).limit(6).get();
    similar = similarSnap.docs
      .filter((d) => d.id !== cropId)
      .slice(0, 4)
      .map((d) => ({ ...snapToObj(d), plantId: d.id }));
  } catch { /* ignore */ }

  result.similarCrops = similar;
  return result;
};

// ============================================================
// MAP DATA
// ============================================================

/** Get nursery markers for map view */
exports.getMapData = async ({ lat, lng }) => {
  const nurserySnap = await db.collection(NURSERIES_COL).where('status', '==', 'active').get();
  const nurseries = nurserySnap.docs.map((doc) => decorateNursery(snapToObj(doc), lat, lng));
  return { nurseries };
};

// ============================================================
// REVIEWS
// ============================================================

/** Add a review and update nursery rating */
exports.addReview = async ({ userId, userName, nurseryId, rating, comment }) => {
  if (!nurseryId) throw new Error('nursery_id is required');
  const rat = parseInt(rating, 10);
  if (rat < 1 || rat > 5) throw new Error('Rating must be between 1 and 5');

  const docRef = db.collection(REVIEWS_COL).doc();
  const review = {
    id: docRef.id,
    nurseryId,
    userId,
    userName: userName || 'Farmer',
    rating: rat,
    comment: comment || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await docRef.set(review);

  // Recompute average rating
  const reviewsSnap = await db.collection(REVIEWS_COL).where('nurseryId', '==', nurseryId).get();
  const ratings = reviewsSnap.docs.map((d) => d.data().rating || 0);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  await db.collection(NURSERIES_COL).doc(nurseryId).update({
    rating: Number(avg.toFixed(1)),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { id: docRef.id, ...review, createdAt: new Date().toISOString() };
};

/** Get reviews for a nursery */
exports.getReviews = async (nurseryId) => {
  const snapshot = await db.collection(REVIEWS_COL).where('nurseryId', '==', nurseryId).orderBy('createdAt', 'desc').limit(50).get();
  return snapshot.docs.map(snapToObj);
};

// ============================================================
// WISHLIST
// ============================================================

/** Toggle a wishlist entry */
exports.toggleWishlist = async ({ userId, type, itemId }) => {
  if (!['nursery', 'crop'].includes(type)) throw new Error('Type must be nursery or crop');
  if (!itemId) throw new Error('item_id is required');

  const docId = `wish_${userId}_${itemId}`;
  const ref = db.collection(WISHLIST_COL).doc(docId);
  const doc = await ref.get();

  if (doc.exists) {
    await ref.delete();
    return { saved: false, type, itemId };
  } else {
    await ref.set({
      id: docId,
      userId,
      type,
      itemId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { saved: true, type, itemId };
  }
};

/** Get a user's wishlist with populated nursery/crop details */
exports.getWishlist = async ({ userId, lat, lng }) => {
  const snapshot = await db.collection(WISHLIST_COL).where('userId', '==', userId).get();
  const nurseries = [];
  const crops = [];

  for (const doc of snapshot.docs) {
    const entry = doc.data();
    if (entry.type === 'nursery') {
      const nDoc = await db.collection(NURSERIES_COL).doc(entry.itemId).get();
      if (nDoc.exists) nurseries.push(decorateNursery(snapToObj(nDoc), lat, lng));
    } else if (entry.type === 'crop') {
      const cDoc = await db.collection(CROPS_COL).doc(entry.itemId).get();
      if (cDoc.exists) {
        const crop = snapToObj(cDoc);
        const nDoc = await db.collection(NURSERIES_COL).doc(crop.nurseryId).get();
        const nursery = nDoc.exists ? nDoc.data() : null;
        crops.push(decorateCrop(crop, nursery, lat, lng));
      }
    }
  }

  return { nurseries, crops };
};

// ============================================================
// ORDERS
// ============================================================

/** Create a new order (with stock validation & decrement) */
exports.createOrder = async ({ farmerId, nurseryId, items, fulfillmentType, paymentMethod, address }) => {
  const orderRef = db.collection(ORDERS_COL).doc();

  await db.runTransaction(async (transaction) => {
    let total = 0;

    for (const item of items) {
      const plantRef = db.collection(CROPS_COL).doc(item.plantId);
      const plantDoc = await transaction.get(plantRef);

      if (!plantDoc.exists) throw new Error(`Plant ${item.plantId} not found`);
      const plant = plantDoc.data();

      if (plant.nurseryId !== nurseryId) {
        throw new Error(`Plant ${item.plantId} does not belong to this nursery`);
      }

      if (plant.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${plant.plantName}. Available: ${plant.quantity}`);
      }

      total += parseFloat(plant.price) * item.quantity;
      transaction.update(plantRef, { quantity: plant.quantity - item.quantity });
    }

    const order = {
      orderId: generateOrderId(),
      farmerId,
      nurseryId,
      total,
      status: 'pending',
      fulfillmentType: fulfillmentType || 'pickup',
      paymentMethod: paymentMethod || 'cod',
      address: address || '',
      items: items.map((item) => ({
        plantId: item.plantId,
        quantity: item.quantity,
      })),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    transaction.set(orderRef, order);
  });

  const orderSnap = await orderRef.get();
  const order = snapToObj(orderSnap);

  // Populate item details + nursery name
  const populatedItems = [];
  for (const item of order.items || []) {
    const plantDoc = await db.collection(CROPS_COL).doc(item.plantId).get();
    const plant = plantDoc.data();
    populatedItems.push({
      plantId: item.plantId,
      plantName: plant?.plantName || 'Unknown',
      price: plant?.price || 0,
      quantity: item.quantity,
    });
  }
  order.items = populatedItems;

  const nurseryDoc = await db.collection(NURSERIES_COL).doc(nurseryId).get();
  order.nurseryName = nurseryDoc.exists ? nurseryDoc.data().nurseryName : '';

  // Create notification
  try {
    await db.collection(NOTIFICATIONS_COL).add({
      userId: farmerId,
      title: 'Order placed successfully',
      type: 'order',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch { /* non-critical */ }

  return order;
};

/** Get farmer's orders */
exports.getFarmerOrders = async (farmerId) => {
  const snapshot = await db.collection(ORDERS_COL).where('farmerId', '==', farmerId).orderBy('createdAt', 'desc').limit(100).get();
  const orders = [];
  for (const doc of snapshot.docs) {
    const order = snapToObj(doc);
    const nurseryDoc = await db.collection(NURSERIES_COL).doc(order.nurseryId).get();
    order.nurseryName = nurseryDoc.exists ? nurseryDoc.data().nurseryName : 'Unknown';
    const populatedItems = [];
    for (const item of order.items || []) {
      const plantDoc = await db.collection(CROPS_COL).doc(item.plantId).get();
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
  const snapshot = await db.collection(ORDERS_COL).where('nurseryId', '==', nurseryId).orderBy('createdAt', 'desc').limit(100).get();
  const orders = [];
  for (const doc of snapshot.docs) {
    const order = snapToObj(doc);
    let farmerName = 'Unknown';
    let farmerEmail = '';
    try {
      const userRecord = await admin.auth().getUser(order.farmerId);
      farmerName = userRecord.displayName || userRecord.email || 'Unknown';
      farmerEmail = userRecord.email || '';
    } catch { /* farmer not found */ }
    order.farmerName = farmerName;
    order.farmerEmail = farmerEmail;

    const populatedItems = [];
    for (const item of order.items || []) {
      const plantDoc = await db.collection(CROPS_COL).doc(item.plantId).get();
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

    if (order.nurseryId !== nurseryId) throw new Error('Order not associated with this nursery');

    if ((status === 'cancelled' || status === 'rejected') && order.status === 'pending') {
      for (const item of order.items || []) {
        const plantRef = db.collection(CROPS_COL).doc(item.plantId);
        const plantDoc = await transaction.get(plantRef);
        if (plantDoc.exists) {
          const plant = plantDoc.data();
          transaction.update(plantRef, { quantity: (plant.quantity || 0) + item.quantity });
        }
      }
    }

    transaction.update(orderRef, { status, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  });

  const updated = await orderRef.get();
  return snapToObj(updated);
};

// ============================================================
// AI RECOMMENDATIONS
// ============================================================

/** Return AI-style crop & nursery recommendations for a farmer */
exports.getAIRecommendations = async (userId, { limit }) => {
  const lim = parseInt(limit, 10) || 6;

  // Check for stored recommendations
  let stored = [];
  try {
    const recSnap = await db.collection(RECOMMENDATIONS_COL).where('userId', '==', userId).limit(1).get();
    if (!recSnap.empty) stored = recSnap.docs[0].data().crops || [];
  } catch { /* ignore */ }

  // Fallback recommendations based on popular crops
  let recommendedCrops = [];
  let nurseries = [];
  try {
    const cropSnap = await db.collection(CROPS_COL).where('quantity', '>', 0).limit(100).get();
    const freq = {};
    for (const doc of cropSnap.docs) {
      const c = doc.data();
      freq[c.plantName] = (freq[c.plantName] || 0) + 1;
    }
    const topNames = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, lim).map(([n]) => n);

    const seen = new Set();
    for (const doc of cropSnap.docs) {
      const crop = snapToObj(doc);
      if (topNames.includes(crop.plantName) && !seen.has(crop.plantName)) {
        const nDoc = await db.collection(NURSERIES_COL).doc(crop.nurseryId).get();
        const nursery = nDoc.exists ? nDoc.data() : null;
        recommendedCrops.push(decorateCrop(crop, nursery, null, null));
        seen.add(crop.plantName);
      }
      if (recommendedCrops.length >= lim) break;
    }

    const nSnap = await db.collection(NURSERIES_COL).where('status', '==', 'active').limit(lim).get();
    nurseries = nSnap.docs.map((doc) => snapToObj(doc));
  } catch { /* ignore */ }

  return {
    crops: recommendedCrops,
    nurseries,
    reason: stored.length
      ? `Recommended based on location, season, weather, and past purchases.`
      : `Recommended based on location, season, and soil type.`,
  };
};

// ============================================================
// CHAT / MESSAGES
// ============================================================

/** Get or create a chat between farmer and nursery */
exports.getOrCreateChat = async ({ farmerId, nurseryId }) => {
  if (!nurseryId) throw new Error('nursery_id is required');

  const chatId = `chat_${farmerId}_${nurseryId}`;

  // Check for existing messages in this chat
  const msgSnap = await db.collection(MESSAGES_COL).where('chatId', '==', chatId).orderBy('createdAt', 'asc').limit(100).get();
  const messages = msgSnap.docs.map(snapToObj);

  // Create a welcome message if chat is new
  if (messages.length === 0) {
    const welcomeRef = db.collection(MESSAGES_COL).doc();
    await welcomeRef.set({
      id: welcomeRef.id,
      chatId,
      from: 'nursery',
      text: 'Hello 👋 Welcome to our nursery! How can we help you today?',
      senderId: nurseryId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    messages.push({
      id: welcomeRef.id,
      chatId,
      from: 'nursery',
      text: 'Hello 👋 Welcome to our nursery! How can we help you today?',
      senderId: nurseryId,
      createdAt: new Date().toISOString(),
    });
  }

  return { chatId, messages };
};

/** Send a message in a chat */
exports.sendMessage = async ({ chatId, senderId, text }) => {
  if (!chatId || !text) throw new Error('chatId and text are required');
  const docRef = db.collection(MESSAGES_COL).doc();
  await docRef.set({
    id: docRef.id,
    chatId,
    senderId,
    text,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const msgSnap = await db.collection(MESSAGES_COL).where('chatId', '==', chatId).orderBy('createdAt', 'asc').limit(100).get();
  return msgSnap.docs.map(snapToObj);
};

// ============================================================
// LEGACY SEARCH & DETAIL
// ============================================================

/** Legacy: search plants across active nurseries */
exports.searchPlants = async ({ query, lat, lng }) => {
  const nurseriesSnap = await db.collection(NURSERIES_COL).where('status', '==', 'active').get();
  const activeNurseryIds = new Set();
  const nurseryMap = {};
  nurseriesSnap.docs.forEach((doc) => {
    activeNurseryIds.add(doc.id);
    nurseryMap[doc.id] = doc.data();
  });

  const plantsQuery = db.collection(CROPS_COL).where('quantity', '>', 0);
  const plantsSnap = await plantsQuery.get();
  const results = [];

  plantsSnap.docs.forEach((doc) => {
    const plant = snapToObj(doc);
    if (!activeNurseryIds.has(plant.nurseryId)) return;

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

    row.distance_km = haversine(lat, lng, row.latitude, row.longitude);
    results.push(row);
  });

  if (lat && lng) results.sort((a, b) => (a.distance_km || 99999) - (b.distance_km || 99999));
  return results;
};

/** Get a single nursery detail with its crops */
exports.getNurseryDetail = async (nurseryId) => {
  const doc = await db.collection(NURSERIES_COL).doc(nurseryId).get();
  if (!doc.exists) return null;
  const nursery = snapToObj(doc);

  const plants = await exports.getNurseryPlants(nurseryId);
  const reviews = await exports.getReviews(nurseryId);

  return {
    ...nursery,
    plants,
    reviews,
    open_now: isOpenNow(nursery),
    cropCount: plants.length,
  };
};

// ============================================================
// DASHBOARD
// ============================================================

/** Get nursery dashboard summary */
exports.getDashboardSummary = async (nurseryId) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const ordersSnap = await db.collection(ORDERS_COL).where('nurseryId', '==', nurseryId).get();
  const plantsSnap = await db.collection(CROPS_COL).where('nurseryId', '==', nurseryId).get();

  let pendingCount = 0;
  let completedCount = 0;
  let revenueTotal = 0;
  let todaysOrdersCount = 0;

  ordersSnap.docs.forEach((doc) => {
    const order = doc.data();
    if (order.status === 'pending' || order.status === 'accepted' || order.status === 'dispatched') pendingCount++;
    if (order.status === 'completed') {
      completedCount++;
      revenueTotal += parseFloat(order.total) || 0;
    }
    if (order.createdAt) {
      const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      if (orderDate >= todayStart) todaysOrdersCount++;
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

// ============================================================
// ADMIN
// ============================================================

/** Get all nurseries (admin) */
exports.getAllNurseries = async () => {
  const snapshot = await db.collection(NURSERIES_COL).orderBy('createdAt', 'desc').limit(200).get();
  return snapshot.docs.map((doc) => {
    const n = snapToObj(doc);
    // Count crops
    return n;
  });
};

/** Get all orders (admin) */
exports.getAllOrders = async () => {
  const snapshot = await db.collection(ORDERS_COL).orderBy('createdAt', 'desc').limit(200).get();
  const orders = [];
  for (const doc of snapshot.docs) {
    const order = snapToObj(doc);
    const nurseryDoc = await db.collection(NURSERIES_COL).doc(order.nurseryId).get();
    order.nurseryName = nurseryDoc.exists ? nurseryDoc.data().nurseryName : 'Unknown';
    orders.push(order);
  }
  return orders;
};

/** Update nursery status (approve / reject / suspend) */
exports.updateNurseryStatus = async (nurseryId, status) => {
  const valid = ['pending', 'active', 'rejected', 'suspended'];
  if (!valid.includes(status)) throw new Error('Invalid status');
  await db.collection(NURSERIES_COL).doc(nurseryId).update({
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  const updated = await db.collection(NURSERIES_COL).doc(nurseryId).get();
  return snapToObj(updated);
};

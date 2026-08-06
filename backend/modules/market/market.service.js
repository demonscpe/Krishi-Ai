const admin = require("../../config/firebase");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../../config/jwt");

const db = admin.firestore();

// Firestore Collections
const USERS_COL = "market_users";
const AGENT_PROFILES_COL = "market_agent_profiles";
const FARMER_PROFILES_COL = "market_farmer_profiles";
const LIVE_PRICES_COL = "market_live_prices";
const PRICE_HISTORY_COL = "market_price_history";
const CONTRACTS_COL = "market_contracts";

const MANDI_LOCATIONS = [
  { id: "Kuppam Market", name: "📍 Kuppam Market", district: "Chittoor" },
  { id: "Gudupalle Market", name: "📍 Gudupalle Market", district: "Chittoor" },
  { id: "Madanapalle Market", name: "📍 Madanapalle Market", district: "Annamayya" },
  { id: "Nashik APMC Market", name: "📍 Nashik APMC Market", district: "Nashik" }
];

/**
 * Quick authentication / login helper
 */
async function quickAuth(role = "farmer", name = null, phone = null) {
  let targetPhone = phone;
  let targetName = name;

  if (!targetPhone) {
    targetPhone = role === "agent" ? "9876543210" : role === "admin" ? "9999999999" : "9123456789";
  }
  if (!targetName) {
    targetName = role === "agent" ? "Kuppam Mandi Traders" : role === "admin" ? "Head of Krishi-AI" : "Anand Shinde";
  }

  const snapshot = await db.collection(USERS_COL).where("phone", "==", targetPhone).limit(1).get();

  let userId;
  let userData;

  if (snapshot.empty) {
    const userRef = db.collection(USERS_COL).doc();
    userId = userRef.id;
    userData = {
      id: userId,
      name: targetName,
      phone: targetPhone,
      email: `${role}@krishiai.com`,
      role: role,
      verificationStatus: "approved",
      ratingAvg: role === "agent" ? 4.8 : 5.0,
      createdAt: new Date().toISOString(),
    };
    await userRef.set(userData);

    if (role === "agent") {
      await db.collection(AGENT_PROFILES_COL).doc(userId).set({
        userId,
        shopName: "Kuppam Farmers Procurement Center #01",
        mandiName: "Kuppam Market",
        licenseNo: "APMC-KUP-2024-101",
        shopId: "APMC-KUP-2024-101",
        proofDoc: "Kuppam Mandi License Certificate #KUP-101",
        verificationStatus: "approved",
        operatingHours: "05:00 AM - 08:00 PM",
        storageCapacity: "100 Tons Storage",
        cropsDealt: ["Tomato", "Onion", "Marigold Flowers", "Rice (Paddy)", "Green Chilli"],
        location: { city: "Kuppam", lat: 12.75, lng: 78.36 },
      });
    }
  } else {
    const doc = snapshot.docs[0];
    userId = doc.id;
    userData = { id: userId, ...doc.data() };
  }

  const token = jwt.sign(
    { id: userId, name: userData.name, phone: userData.phone, role: userData.role },
    jwtConfig.secret,
    jwtConfig.accessToken
  );

  return {
    token,
    user: userData,
  };
}

/**
 * Mandi Agent Login with Email/Phone, Password & Shop ID
 */
async function loginAgent(emailOrPhone, password, shopId = null) {
  const snapPhone = await db.collection(USERS_COL).where("phone", "==", emailOrPhone).where("role", "==", "agent").limit(1).get();
  let userDoc = snapPhone.empty ? null : snapPhone.docs[0];

  if (!userDoc) {
    const snapEmail = await db.collection(USERS_COL).where("email", "==", emailOrPhone).where("role", "==", "agent").limit(1).get();
    userDoc = snapEmail.empty ? null : snapEmail.docs[0];
  }

  if (!userDoc) {
    // Return provisioning for agent login
    const result = await quickAuth("agent", "Kuppam Mandi Traders", emailOrPhone || "9876543210");
    return result;
  }

  const userData = { id: userDoc.id, ...userDoc.data() };

  // Fetch shop profile
  const profileDoc = await db.collection(AGENT_PROFILES_COL).doc(userDoc.id).get();
  const profileData = profileDoc.exists ? profileDoc.data() : { mandiName: "Kuppam Market", shopName: "Kuppam Procurement Center #01", licenseNo: shopId || "APMC-KUP-2024-101" };

  const token = jwt.sign(
    { id: userDoc.id, name: userData.name, phone: userData.phone, role: userData.role },
    jwtConfig.secret,
    jwtConfig.accessToken
  );

  return {
    token,
    user: userData,
    profile: profileData
  };
}

/**
 * Register a new Mandi Agent with Shop details and Proof documents
 */
async function registerAgent(agentData) {
  const { name, phone, email, password, shopName, mandiName, licenseNo, proofDoc, storageCapacity, operatingHours, cropsDealt } = agentData;

  const snap = await db.collection(USERS_COL).where("phone", "==", phone).limit(1).get();
  if (!snap.empty) {
    throw new Error("An account with this phone number already exists.");
  }

  const userRef = db.collection(USERS_COL).doc();
  const userId = userRef.id;

  const newUser = {
    id: userId,
    name,
    phone,
    email: email || `${phone}@mandi.krishiai.com`,
    role: "agent",
    verificationStatus: "pending",
    ratingAvg: 4.5,
    createdAt: new Date().toISOString(),
  };

  await userRef.set(newUser);

  const profileData = {
    userId,
    shopName: shopName || `${name} Mandi Shop`,
    mandiName: mandiName || "Kuppam Market",
    licenseNo: licenseNo || "PENDING-LICENSE",
    shopId: licenseNo || "PENDING-LICENSE",
    proofDoc: proofDoc || "APMC Mandi Registration Document submitted",
    verificationStatus: "pending",
    storageCapacity: storageCapacity || "50 Tons Storage",
    operatingHours: operatingHours || "06:00 AM - 07:00 PM",
    cropsDealt: cropsDealt || ["Tomato", "Onion", "Wheat", "Green Chilli", "Flowers"],
    registeredAt: new Date().toISOString(),
  };

  await db.collection(AGENT_PROFILES_COL).doc(userId).set(profileData);

  const token = jwt.sign(
    { id: userId, name: newUser.name, phone: newUser.phone, role: newUser.role },
    jwtConfig.secret,
    jwtConfig.accessToken
  );

  return {
    token,
    user: newUser,
    profile: profileData,
    message: "Registration submitted successfully! Pending Head of Krishi-AI Admin verification.",
  };
}

/**
 * Get all pending agent registrations for Admin review
 */
async function getPendingAgents() {
  const snap = await db.collection(AGENT_PROFILES_COL).where("verificationStatus", "==", "pending").get();
  const pendingList = [];

  for (const doc of snap.docs) {
    const profile = doc.data();
    const userDoc = await db.collection(USERS_COL).doc(profile.userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    pendingList.push({
      ...profile,
      agentName: userData.name,
      phone: userData.phone,
      email: userData.email,
    });
  }

  return pendingList;
}

/**
 * Admin verifies and approves/rejects an agent shop
 */
async function verifyAgent(agentId, action = "approved") {
  const userRef = db.collection(USERS_COL).doc(agentId);
  const profileRef = db.collection(AGENT_PROFILES_COL).doc(agentId);

  await userRef.update({ verificationStatus: action });
  await profileRef.update({ verificationStatus: action });

  return {
    agentId,
    verificationStatus: action,
    message: action === "approved" ? "Agent approved and pushed to live Mandi Shops!" : "Agent registration rejected.",
  };
}

/**
 * Get directory of all active/approved Mandi Agents & Shops
 */
async function getAgentsList(mandiName = null) {
  let query = db.collection(AGENT_PROFILES_COL);
  if (mandiName) {
    query = query.where("mandiName", "==", mandiName);
  }

  const snap = await query.get();
  const list = [];

  for (const doc of snap.docs) {
    const profile = doc.data();
    const userDoc = await db.collection(USERS_COL).doc(profile.userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    list.push({
      ...profile,
      id: profile.userId,
      agentName: userData.name,
      phone: userData.phone,
      email: userData.email,
      ratingAvg: userData.ratingAvg || 4.8,
    });
  }

  return list;
}

/**
 * Fetch live commodity prices
 */
async function getLivePrices(filters = {}) {
  let query = db.collection(LIVE_PRICES_COL);

  if (filters.mandiName) {
    query = query.where("mandiName", "==", filters.mandiName);
  }
  if (filters.cropName) {
    query = query.where("cropName", "==", filters.cropName);
  }
  if (filters.agentId) {
    query = query.where("agentId", "==", filters.agentId);
  }

  const snapshot = await query.get();
  const prices = [];

  snapshot.forEach((doc) => {
    prices.push({ id: doc.id, ...doc.data() });
  });

  prices.sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt));

  return prices;
}

/**
 * Update or set a live price (for Agents)
 */
async function updateLivePrice(agentId, cropName, currentPrice, availableQtyKg = 1000, category = "Vegetables", trend = "stable", mandiName = "Kuppam Market") {
  const userDoc = await db.collection(USERS_COL).doc(agentId).get();
  const userData = userDoc.exists ? userDoc.data() : { name: "Mandi Agent" };

  const agentProfileDoc = await db.collection(AGENT_PROFILES_COL).doc(agentId).get();
  const profileData = agentProfileDoc.exists ? agentProfileDoc.data() : {};
  const shopName = profileData.shopName || "Mandi Procurement Center";
  const licenseNo = profileData.licenseNo || profileData.shopId || "APMC-VERIFIED";
  const targetMandi = mandiName || profileData.mandiName || "Kuppam Market";

  const numPrice = Number(currentPrice);
  const numQty = Number(availableQtyKg);
  const nowStr = new Date().toISOString();

  const snapshot = await db
    .collection(LIVE_PRICES_COL)
    .where("agentId", "==", agentId)
    .where("cropName", "==", cropName)
    .limit(1)
    .get();

  let priceId;
  let priceData;

  if (snapshot.empty) {
    const ref = db.collection(LIVE_PRICES_COL).doc();
    priceId = ref.id;
    priceData = {
      id: priceId,
      agentId,
      agentName: userData.name,
      shopName,
      licenseNo,
      cropName,
      category,
      mandiName: targetMandi,
      currentPrice: numPrice,
      availableQtyKg: numQty,
      trend,
      lastUpdatedAt: nowStr,
    };
    await ref.set(priceData);
  } else {
    const doc = snapshot.docs[0];
    priceId = doc.id;
    const oldPrice = doc.data().currentPrice || numPrice;
    const computedTrend = numPrice > oldPrice ? "up" : numPrice < oldPrice ? "down" : trend;

    priceData = {
      ...doc.data(),
      currentPrice: numPrice,
      availableQtyKg: numQty,
      category: category || doc.data().category || "Vegetables",
      mandiName: targetMandi,
      trend: computedTrend,
      lastUpdatedAt: nowStr,
    };
    await db.collection(LIVE_PRICES_COL).doc(priceId).update({
      currentPrice: numPrice,
      availableQtyKg: numQty,
      category: category || doc.data().category || "Vegetables",
      mandiName: targetMandi,
      trend: computedTrend,
      lastUpdatedAt: nowStr,
    });
  }

  await db.collection(PRICE_HISTORY_COL).add({
    agentId,
    agentName: userData.name,
    cropName,
    category,
    mandiName: targetMandi,
    price: numPrice,
    recordedAt: nowStr,
  });

  return priceData;
}

/**
 * Get historical price points for charts
 */
async function getPriceHistory(cropName = null, mandiName = null) {
  let query = db.collection(PRICE_HISTORY_COL);

  if (cropName) {
    query = query.where("cropName", "==", cropName);
  }
  if (mandiName) {
    query = query.where("mandiName", "==", mandiName);
  }

  const snapshot = await query.get();
  const history = [];

  snapshot.forEach((doc) => {
    history.push({ id: doc.id, ...doc.data() });
  });

  history.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));

  return history;
}

/**
 * Get contracts for user (farmer or agent)
 */
async function getContracts(userId, role = "farmer") {
  let query = db.collection(CONTRACTS_COL);

  if (role === "farmer") {
    query = query.where("farmerId", "==", userId);
  } else if (role === "agent") {
    query = query.where("agentId", "==", userId);
  }

  const snapshot = await query.get();
  const contracts = [];

  snapshot.forEach((doc) => {
    contracts.push({ id: doc.id, ...doc.data() });
  });

  contracts.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));

  return contracts;
}

/**
 * Create a contract agreement
 */
async function createContract(farmerId, agentId, cropName, quantityKg, lockedPricePerKg, mandiName = "Kuppam Market", notes = "") {
  const farmerDoc = await db.collection(USERS_COL).doc(farmerId).get();
  const farmerName = farmerDoc.exists ? farmerDoc.data().name : "Farmer";

  const agentDoc = await db.collection(USERS_COL).doc(agentId).get();
  const agentName = agentDoc.exists ? agentDoc.data().name : "Agent";

  const numQty = Number(quantityKg);
  const numPrice = Number(lockedPricePerKg);
  const totalValue = numQty * numPrice;
  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const ref = db.collection(CONTRACTS_COL).doc();
  const contractData = {
    id: ref.id,
    farmerId,
    farmerName,
    agentId,
    agentName,
    mandiName,
    cropName,
    quantityKg: numQty,
    lockedPricePerKg: numPrice,
    totalValue,
    bookedAt: now.toISOString(),
    expiryTime: expiry.toISOString(),
    status: "booked",
    notes,
  };

  await ref.set(contractData);
  return contractData;
}

/**
 * Update contract status
 */
async function updateContractStatus(contractId, status, notes = null) {
  const ref = db.collection(CONTRACTS_COL).doc(contractId);
  const doc = await ref.get();

  if (!doc.exists) {
    throw new Error("Contract not found");
  }

  const updates = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (notes !== null) {
    updates.notes = notes;
  }

  await ref.update(updates);

  const updatedDoc = await ref.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

/**
 * Seed full demo market data with distinct Mandi locations (Kuppam, Gudupalle, Nashik)
 */
async function seedMarketData() {
  const agentsData = [
    {
      phone: "9876543210",
      email: "kuppam.agent@krishiai.com",
      name: "Kuppam Mandi Traders",
      shopName: "Kuppam Farmers Procurement Center #01",
      mandiName: "Kuppam Market",
      licenseNo: "APMC-KUP-2024-101",
      shopId: "APMC-KUP-2024-101",
      proofDoc: "Kuppam Mandi Establishment Registration #KUP-101",
      verificationStatus: "approved",
      operatingHours: "05:00 AM - 08:00 PM",
      storageCapacity: "100 Tons Storage",
      cropsDealt: ["Tomato", "Onion", "Marigold Flowers", "Rice (Paddy)", "Green Chilli"],
    },
    {
      phone: "9876543211",
      name: "Gudupalle Agro Shop",
      email: "gudupalle.agent@krishiai.com",
      shopName: "Gudupalle Co-op Procurement Yard",
      mandiName: "Gudupalle Market",
      licenseNo: "APMC-GDP-2024-202",
      shopId: "APMC-GDP-2024-202",
      proofDoc: "APMC Mandi Trade License Certificate #GDP-202",
      verificationStatus: "approved",
      operatingHours: "06:00 AM - 07:00 PM",
      storageCapacity: "80 Tons Storage",
      cropsDealt: ["Tomato", "Mango", "Potato", "Jasmine Flowers", "Groundnut"],
    },
    {
      phone: "9876543212",
      name: "Ramesh Nashik Traders",
      email: "nashik.agent@krishiai.com",
      shopName: "Ramesh Mandi Shop #12",
      mandiName: "Nashik APMC Market",
      licenseNo: "APMC-NSK-2024-884",
      shopId: "APMC-NSK-2024-884",
      proofDoc: "APMC License Certificate #NSK-884",
      verificationStatus: "approved",
      operatingHours: "05:00 AM - 08:00 PM",
      storageCapacity: "120 Tons Cold Storage",
      cropsDealt: ["Grapes", "Onion", "Wheat", "Sugarcane"],
    }
  ];

  const agentIds = [];

  for (const item of agentsData) {
    const snap = await db.collection(USERS_COL).where("phone", "==", item.phone).limit(1).get();
    let aid;
    if (snap.empty) {
      const uref = db.collection(USERS_COL).doc();
      aid = uref.id;
      await uref.set({
        id: aid,
        name: item.name,
        phone: item.phone,
        email: item.email,
        role: "agent",
        verificationStatus: item.verificationStatus,
        ratingAvg: 4.8,
        createdAt: new Date().toISOString(),
      });
      await db.collection(AGENT_PROFILES_COL).doc(aid).set({
        userId: aid,
        shopName: item.shopName,
        mandiName: item.mandiName,
        licenseNo: item.licenseNo,
        shopId: item.shopId,
        proofDoc: item.proofDoc,
        verificationStatus: item.verificationStatus,
        operatingHours: item.operatingHours,
        storageCapacity: item.storageCapacity,
        cropsDealt: item.cropsDealt,
      });
    } else {
      aid = snap.docs[0].id;
    }
    agentIds.push(aid);
  }

  // Farmers
  const farmersData = [
    { phone: "9123456789", name: "Anand Shinde", village: "Kuppam Rural" },
    { phone: "9123456790", name: "Suresh Reddy", village: "Gudupalle Village" },
  ];

  const farmerIds = [];
  for (const item of farmersData) {
    const snap = await db.collection(USERS_COL).where("phone", "==", item.phone).limit(1).get();
    let fid;
    if (snap.empty) {
      const uref = db.collection(USERS_COL).doc();
      fid = uref.id;
      await uref.set({
        id: fid,
        name: item.name,
        phone: item.phone,
        role: "farmer",
        ratingAvg: 5.0,
        createdAt: new Date().toISOString(),
      });
      await db.collection(FARMER_PROFILES_COL).doc(fid).set({
        userId: fid,
        village: item.village,
        district: "Chittoor",
      });
    } else {
      fid = snap.docs[0].id;
    }
    farmerIds.push(fid);
  }

  // Location Specific Prices
  const locationPrices = [
    // Kuppam Market Prices
    { agentIndex: 0, cropName: "Tomato", category: "Vegetables", currentPrice: 24, availableQtyKg: 1500, trend: "up", mandiName: "Kuppam Market" },
    { agentIndex: 0, cropName: "Onion", category: "Vegetables", currentPrice: 38, availableQtyKg: 2000, trend: "up", mandiName: "Kuppam Market" },
    { agentIndex: 0, cropName: "Marigold Flowers", category: "Flowers", currentPrice: 60, availableQtyKg: 500, trend: "up", mandiName: "Kuppam Market" },
    { agentIndex: 0, cropName: "Rice (Paddy)", category: "Grains & Cereals", currentPrice: 34, availableQtyKg: 3000, trend: "stable", mandiName: "Kuppam Market" },
    { agentIndex: 0, cropName: "Green Chilli", category: "Vegetables", currentPrice: 45, availableQtyKg: 800, trend: "up", mandiName: "Kuppam Market" },

    // Gudupalle Market Prices
    { agentIndex: 1, cropName: "Tomato", category: "Vegetables", currentPrice: 22, availableQtyKg: 1200, trend: "stable", mandiName: "Gudupalle Market" },
    { agentIndex: 1, cropName: "Mango", category: "Fruits", currentPrice: 80, availableQtyKg: 600, trend: "down", mandiName: "Gudupalle Market" },
    { agentIndex: 1, cropName: "Potato", category: "Vegetables", currentPrice: 20, availableQtyKg: 2500, trend: "stable", mandiName: "Gudupalle Market" },
    { agentIndex: 1, cropName: "Jasmine Flowers", category: "Flowers", currentPrice: 120, availableQtyKg: 300, trend: "up", mandiName: "Gudupalle Market" },
    { agentIndex: 1, cropName: "Groundnut", category: "Cash Crops", currentPrice: 65, availableQtyKg: 1800, trend: "up", mandiName: "Gudupalle Market" },

    // Nashik APMC Market Prices
    { agentIndex: 2, cropName: "Grapes", category: "Fruits", currentPrice: 65, availableQtyKg: 4000, trend: "up", mandiName: "Nashik APMC Market" },
    { agentIndex: 2, cropName: "Onion", category: "Vegetables", currentPrice: 35, availableQtyKg: 5000, trend: "up", mandiName: "Nashik APMC Market" },
    { agentIndex: 2, cropName: "Wheat", category: "Grains & Cereals", currentPrice: 28, availableQtyKg: 6000, trend: "down", mandiName: "Nashik APMC Market" }
  ];

  for (const p of locationPrices) {
    const aid = agentIds[p.agentIndex];
    await updateLivePrice(aid, p.cropName, p.currentPrice, p.availableQtyKg, p.category, p.trend, p.mandiName);
  }

  return { message: "Seeded location-based Mandi markets (Kuppam, Gudupalle, Nashik) successfully into Firebase Firestore!" };
}

module.exports = {
  quickAuth,
  loginAgent,
  registerAgent,
  getPendingAgents,
  verifyAgent,
  getAgentsList,
  getLivePrices,
  updateLivePrice,
  getPriceHistory,
  getContracts,
  createContract,
  updateContractStatus,
  seedMarketData,
  MANDI_LOCATIONS
};

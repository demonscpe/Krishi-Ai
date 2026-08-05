const admin = require('../../config/firebase');

const db = admin.firestore();

// ============================================================
// DEMO / SEED DATA GENERATOR
// Populates realistic nursery marketplace data into Firestore.
// Collections: nurseries, crops, cropCategories, reviews,
//   wishlist, orders, notifications, messages, recommendations
// ============================================================

const DISTRICTS = [
  { name: 'Kuppam', district: 'Chittoor', lat: 12.7459, lng: 78.3282 },
  { name: 'Chittoor', district: 'Chittoor', lat: 13.2172, lng: 79.1003 },
  { name: 'Tirupati', district: 'Tirupati', lat: 13.6288, lng: 79.4192 },
  { name: 'Madanapalle', district: 'Annamayya', lat: 13.5503, lng: 78.5029 },
  { name: 'Palamaner', district: 'Chittoor', lat: 13.1867, lng: 78.7421 },
  { name: 'Punganur', district: 'Chittoor', lat: 13.3686, lng: 78.5714 },
  { name: 'Kadapa', district: 'YSR Kadapa', lat: 14.4674, lng: 78.8241 },
  { name: 'Anantapur', district: 'Anantapur', lat: 14.6819, lng: 77.6006 },
];

const NURSERY_STEMS = [
  'Green Valley', 'Saravana', 'Perarasu', 'Sri Balaji', 'GVS', 'PNK',
  'Kuppam Agro', 'Golden Leaf', 'Haritha', 'Venkateswara', 'Sai', 'Lakshmi',
  'Annapurna', 'Krishna', 'Nandi', 'Sreenivasa', 'Tirumala', 'Vara Prasad',
  'Chandana', 'Girija', 'Pavani', 'Suresh', 'Rama', 'Govinda',
  'Bharat', 'Usha', 'Manasa', 'Ravi', 'Sravani', 'Harikrishna',
];

const CATEGORIES = [
  { name: 'Vegetables', icon: '🥬' },
  { name: 'Fruit Plants', icon: '🥭' },
  { name: 'Flower Plants', icon: '🌸' },
  { name: 'Medicinal', icon: '🌿' },
  { name: 'Forest', icon: '🌳' },
  { name: 'Shade Plants', icon: '🌳' },
  { name: 'Indoor Plants', icon: '🪴' },
  { name: 'Outdoor Plants', icon: '🌻' },
  { name: 'Seeds', icon: '🌱' },
  { name: 'Saplings', icon: '🌱' },
  { name: 'Organic Plants', icon: '🌾' },
];

// Crop catalog: [name, category, scientificName, basePrice, water, sunlight, season, age, height]
const CROP_CATALOG = [
  ['Tomato', 'Vegetables', 'Solanum lycopersicum', 4, 'Moderate', 'Full sun', 'Kharif', 4, 30],
  ['Chilli', 'Vegetables', 'Capsicum annuum', 3, 'Low', 'Full sun', 'Kharif', 3, 25],
  ['Brinjal', 'Vegetables', 'Solanum melongena', 5, 'Moderate', 'Full sun', 'Kharif', 4, 35],
  ['Cabbage', 'Vegetables', 'Brassica oleracea', 6, 'High', 'Partial sun', 'Rabi', 5, 20],
  ['Cauliflower', 'Vegetables', 'Brassica oleracea var. botrytis', 7, 'High', 'Full sun', 'Rabi', 5, 25],
  ['Capsicum', 'Vegetables', 'Capsicum annuum', 8, 'Moderate', 'Full sun', 'Zaid', 5, 40],
  ['Onion', 'Vegetables', 'Allium cepa', 2, 'Low', 'Full sun', 'Rabi', 6, 30],
  ['Cucumber', 'Vegetables', 'Cucumis sativus', 4, 'High', 'Full sun', 'Zaid', 3, 20],
  ['Ladies Finger', 'Vegetables', 'Abelmoschus esculentus', 3, 'Moderate', 'Full sun', 'Kharif', 3, 40],
  ['Spinach', 'Vegetables', 'Spinacia oleracea', 2, 'High', 'Partial sun', 'Rabi', 2, 15],
  ['Carrot', 'Vegetables', 'Daucus carota', 3, 'Moderate', 'Full sun', 'Rabi', 5, 20],
  ['Beetroot', 'Vegetables', 'Beta vulgaris', 4, 'Moderate', 'Full sun', 'Rabi', 5, 20],
  ['Mango', 'Fruit Plants', 'Mangifera indica', 120, 'Low', 'Full sun', 'Perennial', 24, 150],
  ['Banana', 'Fruit Plants', 'Musa paradisiaca', 60, 'High', 'Full sun', 'Perennial', 12, 200],
  ['Guava', 'Fruit Plants', 'Psidium guajava', 80, 'Moderate', 'Full sun', 'Perennial', 18, 120],
  ['Papaya', 'Fruit Plants', 'Carica papaya', 40, 'Moderate', 'Full sun', 'Perennial', 10, 100],
  ['Coconut', 'Fruit Plants', 'Cocos nucifera', 150, 'Moderate', 'Full sun', 'Perennial', 24, 100],
  ['Apple', 'Fruit Plants', 'Malus domestica', 200, 'High', 'Full sun', 'Perennial', 30, 180],
  ['Pomegranate', 'Fruit Plants', 'Punica granatum', 90, 'Low', 'Full sun', 'Perennial', 20, 140],
  ['Grapes', 'Fruit Plants', 'Vitis vinifera', 100, 'Moderate', 'Full sun', 'Perennial', 24, 160],
  ['Sapota', 'Fruit Plants', 'Manilkara zapota', 85, 'Moderate', 'Full sun', 'Perennial', 18, 130],
  ['Lemon', 'Fruit Plants', 'Citrus limon', 70, 'Moderate', 'Full sun', 'Perennial', 16, 110],
  ['Rose', 'Flower Plants', 'Rosa hybrida', 25, 'Moderate', 'Full sun', 'Perennial', 6, 60],
  ['Marigold', 'Flower Plants', 'Tagetes erecta', 12, 'Low', 'Full sun', 'Zaid', 3, 30],
  ['Jasmine', 'Flower Plants', 'Jasminum sambac', 35, 'Moderate', 'Partial sun', 'Perennial', 8, 80],
  ['Hibiscus', 'Flower Plants', 'Hibiscus rosa-sinensis', 30, 'Moderate', 'Full sun', 'Perennial', 8, 90],
  ['Lotus', 'Flower Plants', 'Nelumbo nucifera', 50, 'High', 'Full sun', 'Perennial', 10, 40],
  ['Sunflower', 'Flower Plants', 'Helianthus annuus', 15, 'Low', 'Full sun', 'Zaid', 3, 120],
  ['Lily', 'Flower Plants', 'Lilium', 45, 'Moderate', 'Partial sun', 'Rabi', 8, 70],
  ['Tulip', 'Flower Plants', 'Tulipa', 55, 'Low', 'Partial sun', 'Rabi', 8, 50],
  ['Tulsi', 'Medicinal', 'Ocimum tenuiflorum', 20, 'Low', 'Full sun', 'Perennial', 4, 45],
  ['Aloe Vera', 'Medicinal', 'Aloe barbadensis', 40, 'Low', 'Partial sun', 'Perennial', 8, 50],
  ['Neem', 'Medicinal', 'Azadirachta indica', 60, 'Low', 'Full sun', 'Perennial', 18, 120],
  ['Ashwagandha', 'Medicinal', 'Withania somnifera', 35, 'Low', 'Full sun', 'Kharif', 6, 50],
  ['Shatavari', 'Medicinal', 'Asparagus racemosus', 45, 'Moderate', 'Partial sun', 'Perennial', 12, 90],
  ['Brahmi', 'Medicinal', 'Bacopa monnieri', 30, 'High', 'Partial sun', 'Perennial', 6, 30],
  ['Amalaki', 'Medicinal', 'Phyllanthus emblica', 80, 'Moderate', 'Full sun', 'Perennial', 20, 150],
  ['Teak', 'Forest', 'Tectona grandis', 90, 'Moderate', 'Full sun', 'Perennial', 24, 200],
  ['Sandalwood', 'Forest', 'Santalum album', 250, 'Low', 'Full sun', 'Perennial', 36, 180],
  ['Eucalyptus', 'Forest', 'Eucalyptus globulus', 40, 'Moderate', 'Full sun', 'Perennial', 12, 180],
  ['Bamboo', 'Forest', 'Bambusa vulgaris', 70, 'High', 'Full sun', 'Perennial', 12, 250],
  ['Casuarina', 'Forest', 'Casuarina equisetifolia', 35, 'Low', 'Full sun', 'Perennial', 12, 150],
  ['Silver Oak', 'Forest', 'Grevillea robusta', 55, 'Moderate', 'Full sun', 'Perennial', 18, 200],
  ['Banyan', 'Shade Plants', 'Ficus benghalensis', 120, 'Moderate', 'Full sun', 'Perennial', 24, 220],
  ['Peepal', 'Shade Plants', 'Ficus religiosa', 110, 'Moderate', 'Full sun', 'Perennial', 24, 200],
  ['Ashoka', 'Shade Plants', 'Saraca asoca', 85, 'Moderate', 'Partial sun', 'Perennial', 18, 150],
  ['Money Plant', 'Indoor Plants', 'Epipremnum aureum', 50, 'Moderate', 'Indirect light', 'Perennial', 6, 40],
  ['Snake Plant', 'Indoor Plants', 'Sansevieria trifasciata', 45, 'Low', 'Indirect light', 'Perennial', 6, 60],
  ['Peace Lily', 'Indoor Plants', 'Spathiphyllum', 60, 'Moderate', 'Indirect light', 'Perennial', 8, 50],
  ['Areca Palm', 'Indoor Plants', 'Dypsis lutescens', 120, 'Moderate', 'Partial sun', 'Perennial', 12, 120],
  ['Bonsai', 'Indoor Plants', 'Various', 300, 'Low', 'Partial sun', 'Perennial', 36, 40],
  ['Cactus', 'Indoor Plants', 'Cactaceae', 80, 'Low', 'Full sun', 'Perennial', 12, 30],
  ['Croton', 'Indoor Plants', 'Codiaeum variegatum', 55, 'Moderate', 'Indirect light', 'Perennial', 8, 70],
  ['Aglaonema', 'Indoor Plants', 'Aglaonema commutatum', 65, 'Moderate', 'Indirect light', 'Perennial', 8, 60],
  ['Mango Sapling', 'Saplings', 'Mangifera indica', 90, 'Low', 'Full sun', 'Perennial', 12, 90],
  ['Guava Sapling', 'Saplings', 'Psidium guajava', 60, 'Moderate', 'Full sun', 'Perennial', 10, 80],
  ['Papaya Sapling', 'Saplings', 'Carica papaya', 30, 'Moderate', 'Full sun', 'Perennial', 6, 60],
  ['Tomato Seeds', 'Seeds', 'Solanum lycopersicum', 20, 'Moderate', 'Full sun', 'Kharif', 0, 0],
  ['Chilli Seeds', 'Seeds', 'Capsicum annuum', 15, 'Low', 'Full sun', 'Kharif', 0, 0],
  ['Brinjal Seeds', 'Seeds', 'Solanum melongena', 18, 'Moderate', 'Full sun', 'Kharif', 0, 0],
  ['Organic Spinach', 'Organic Plants', 'Spinacia oleracea', 8, 'High', 'Partial sun', 'Rabi', 2, 15],
  ['Organic Tomato', 'Organic Plants', 'Solanum lycopersicum', 10, 'Moderate', 'Full sun', 'Kharif', 4, 30],
  ['Organic Chilli', 'Organic Plants', 'Capsicum annuum', 9, 'Low', 'Full sun', 'Kharif', 3, 25],
  ['Organic Mango', 'Organic Plants', 'Mangifera indica', 180, 'Low', 'Full sun', 'Perennial', 24, 150],
  ['Organic Brinjal', 'Organic Plants', 'Solanum melongena', 12, 'Moderate', 'Full sun', 'Kharif', 4, 35],
];

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80';
const SPRINKLE = 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&q=80';
const SPRINKLE2 = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80';

// Deterministic pseudo-random generator for reproducible seed data
let _seed = 42;
function rnd(scale = 1) {
  _seed = (_seed * 1664525 + 1013904223) % 4294967296;
  return (_seed / 4294967296) * scale;
}
function pick(arr) {
  return arr[Math.floor(rnd(arr.length))];
}
function between(min, max) {
  return min + Math.floor(rnd(max - min + 1));
}

function jitter(base, amount) {
  return base + (rnd() - 0.5) * amount * 2;
}

// Unsplash-style cover images (using picsum for reliability)
const picsum = (id) => `https://picsum.photos/seed/${id}/600/400`;

function buildNursery(index, district) {
  const name = `${NURSERY_STEMS[index % NURSERY_STEMS.length]} ${index % 4 === 0 ? 'Nursery & Gardens' : index % 4 === 1 ? 'Nursery' : index % 4 === 2 ? 'Agro Nursery' : 'Plant Nursery'}`;
  const verified = rnd() < 0.7;
  const organic = rnd() < 0.4;
  const delivery = rnd() < 0.75;
  const parking = rnd() < 0.8;
  const govt = rnd() < 0.5;
  const rating = 3.5 + rnd() * 1.5;
  const open7 = rnd() < 0.7;
  const opening = 6 + Math.floor(rnd() * 3);
  const closing = 18 + Math.floor(rnd() * 4);
  const phone = `+91 9${between(10000000, 99999999)}`;
  const lat = jitter(district.lat, 0.12);
  const lng = jitter(district.lng, 0.12);

  return {
    id: `nursery_seed_${index}`,
    userId: `seed_user_${index}`,
    nurseryName: name,
    ownerName: `${NURSERY_STEMS[index % NURSERY_STEMS.length]} Kumar`,
    phone,
    email: `nursery${index}@krishi.ai`,
    latitude: Number(lat.toFixed(5)),
    longitude: Number(lng.toFixed(5)),
    address: `Main Road, ${district.name}, ${district.district} District, Andhra Pradesh`,
    city: district.name,
    district: district.district,
    state: 'Andhra Pradesh',
    openingTime: `${opening}:00`,
    closingTime: `${closing}:00`,
    openDays: open7 ? 'Open all days' : 'Mon-Sat',
    licenseNumber: `LIC-AP-${between(1000, 9999)}`,
    status: 'active',
    verified,
    featured: index % 5 === 0,
    deliveryAvailable: delivery,
    pickupAvailable: true,
    organicCertified: organic,
    govtApproved: govt,
    parking,
    rating: Number(rating.toFixed(1)),
    followers: between(20, 500),
    cropCount: 0,
    coverImage: picsum(index),
    logo: SpriteFallback(index),
    imageUrl: picsum(index + 100),
    gallery: [picsum(index), picsum(index + 1), picsum(index + 2), picsum(index + 3), picsum(index + 4), picsum(index + 5)],
    about: `${name} is a trusted nursery located in ${district.name}, ${district.district} district. We provide high-quality seedlings, fruit plants, medicinal herbs, and landscaping plants at affordable prices.`,
    open_now: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

function SpriteFallback(i) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(NURSERY_STEMS[i % NURSERY_STEMS.length])}&background=16a34a&color=fff&size=128`;
}

function buildCrop(nursery, cropIndex) {
  const [name, category, scientific, price, water, sunlight, season, age, height] = CROP_CATALOG[cropIndex % CROP_CATALOG.length];
  const organic = category === 'Organic Plants' || nursery.organicCertified;
  const quantity = between(100, 5000);
  const plantId = `${nursery.id}_crop_${cropIndex}`;
  return {
    id: plantId,
    plantId,
    nurseryId: nursery.id,
    nurseryName: nursery.nurseryName,
    nurseryRating: nursery.rating,
    nurseryPhone: nursery.phone,
    nurseryAddress: nursery.address,
    nurseryImage: nursery.logo,
    latitude: nursery.latitude,
    longitude: nursery.longitude,
    plantName: name,
    category,
    scientificName: scientific,
    variety: `${name} Hybrid`,
    description: `High-quality ${name} ${category.toLowerCase()} suitable for ${districtOf(nursery).district} region. Disease-resistant and well-nourished.`,
    price: price + (rnd() < 0.5 ? 0 : between(0, Math.round(price * 0.4))),
    quantity,
    imageUrl: picsum(plantId.length),
    images: [picsum(plantId.length), picsum(plantId.length + 1), picsum(plantId.length + 2)],
    plantAge: age,
    plantAgeUnit: 'months',
    height,
    waterRequirement: water,
    sunlightRequirement: sunlight,
    growingSeason: season,
    expectedYield: `${between(20, 200)} kg`,
    diseaseResistance: between(70, 98),
    organic,
    healthy: true,
    deliveryAvailable: nursery.deliveryAvailable,
    minOrder: 1,
    maxOrder: between(50, 500),
    readyDate: 'Ready to plant',
    rating: Number((3.5 + rnd() * 1.5).toFixed(1)),
    distance_km: null,
    featured: between(0, 10) === 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

function districtOf(nursery) {
  return DISTRICTS.find((d) => d.name === nursery.city) || DISTRICTS[0];
}

function buildReview(nursery, index, userName) {
  const comments = [
    'Very good quality plants and fair pricing.',
    'Healthy seedlings, fast service. Recommended!',
    'Great variety of plants. The staff is knowledgeable.',
    'Ordered tomato seedlings — excellent germination rate.',
    'Best nursery in the area for fruit plants.',
  ];
  return {
    id: `review_seed_${nursery.id}_${index}`,
    nurseryId: nursery.id,
    userId: `seed_farmer_${index % 15}`,
    userName: userName || `Farmer ${index}`,
    rating: between(3, 5),
    comment: comments[index % comments.length],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

function buildOrder(nursery, crop, index) {
  const qty = between(10, 100);
  const statuses = ['pending', 'accepted', 'completed', 'dispatched'];
  const status = statuses[index % statuses.length];
  return {
    id: `order_seed_${index}`,
    orderId: `ORD-DEMO-${String(1000 + index)}`,
    farmerId: `seed_farmer_${index % 15}`,
    nurseryId: nursery.id,
    total: crop.price * qty,
    status,
    fulfillmentType: index % 3 === 0 ? 'delivery' : 'pickup',
    paymentMethod: ['upi', 'cod', 'card'][index % 3],
    items: [
      {
        plantId: crop.plantId,
        plantName: crop.plantName,
        price: crop.price,
        quantity: qty,
      },
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
async function seedDatabase() {
  console.log('🌱 Seeding nursery marketplace...');

  const nurseries = [];
  const crops = [];

  // Build nursery profiles
  for (let i = 0; i < 30; i++) {
    const district = DISTRICTS[i % DISTRICTS.length];
    const nursery = buildNursery(i, district);
    nurseries.push(nursery);
  }

  // Build crops (20-40 per nursery)
  for (let i = 0; i < nurseries.length; i++) {
    const nursery = nurseries[i];
    const count = between(20, 40);
    for (let c = 0; c < count; c++) {
      crops.push(buildCrop(nursery, c + i));
    }
    nursery.cropCount = count;
  }

  // Batch write nurseries
  const nurseryBatches = [];
  let batch = db.batch();
  let ops = 0;
  for (const n of nurseries) {
    batch.set(db.collection('nurseries').doc(n.id), n);
    ops++;
    if (ops >= 400) {
      nurseryBatches.push(batch);
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) nurseryBatches.push(batch);
  for (const b of nurseryBatches) await b.commit();
  console.log(`✅ ${nurseries.length} nurseries seeded`);

  // Batch write crops
  const cropBatches = [];
  batch = db.batch();
  ops = 0;
  for (const c of crops) {
    batch.set(db.collection('crops').doc(c.plantId), c);
    ops++;
    if (ops >= 400) {
      cropBatches.push(batch);
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) cropBatches.push(batch);
  for (const b of cropBatches) await b.commit();
  console.log(`✅ ${crops.length} crops seeded`);

  // Write crop categories
  const catBatch = db.batch();
  CATEGORIES.forEach((cat, i) => {
    catBatch.set(db.collection('cropCategories').doc(`cat_${i}`), {
      id: `cat_${i}`,
      name: cat.name,
      icon: cat.icon,
      order: i,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  await catBatch.commit();
  console.log(`✅ ${CATEGORIES.length} categories seeded`);

  // Reviews (200+)
  const reviewBatches = [];
  batch = db.batch();
  ops = 0;
  let reviewCount = 0;
  for (let i = 0; i < nurseries.length; i++) {
    const n = nurseries[i];
    const count = between(6, 10);
    for (let r = 0; r < count; r++) {
      const rev = buildReview(n, r, `Farmer ${(i * 10 + r) % 15 + 1}`);
      batch.set(db.collection('reviews').doc(rev.id), rev);
      ops++;
      reviewCount++;
      if (ops >= 400) {
        reviewBatches.push(batch);
        batch = db.batch();
        ops = 0;
      }
    }
  }
  if (ops > 0) reviewBatches.push(batch);
  for (const b of reviewBatches) await b.commit();
  console.log(`✅ ${reviewCount} reviews seeded`);

  // Orders (100+)
  const orderBatches = [];
  batch = db.batch();
  ops = 0;
  let orderCount = 0;
  for (let i = 0; i < 120; i++) {
    const n = nurseries[i % nurseries.length];
    const c = crops[(i * 3) % crops.length];
    const order = buildOrder(n, c, i);
    batch.set(db.collection('orders').doc(order.id), order);
    ops++;
    orderCount++;
    if (ops >= 400) {
      orderBatches.push(batch);
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) orderBatches.push(batch);
  for (const b of orderBatches) await b.commit();
  console.log(`✅ ${orderCount} orders seeded`);

  // Wishlist entries (100+)
  const wishBatches = [];
  batch = db.batch();
  ops = 0;
  let wishCount = 0;
  for (let i = 0; i < 120; i++) {
    const type = i % 2 === 0 ? 'nursery' : 'crop';
    const itemId = type === 'nursery' ? nurseries[i % nurseries.length].id : crops[(i * 7) % crops.length].plantId;
    const docId = `wish_${i % 15}_${itemId}`;
    batch.set(db.collection('wishlist').doc(docId), {
      id: docId,
      userId: `seed_farmer_${i % 15}`,
      type,
      itemId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    ops++;
    wishCount++;
    if (ops >= 400) {
      wishBatches.push(batch);
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) wishBatches.push(batch);
  for (const b of wishBatches) await b.commit();
  console.log(`✅ ${wishCount} wishlist entries seeded`);

  // Notifications
  const notifBatches = [];
  batch = db.batch();
  ops = 0;
  for (let i = 0; i < 40; i++) {
    const n = nurseries[i % nurseries.length];
    const docId = `notif_seed_${i}`;
    batch.set(db.collection('notifications').doc(docId), {
      id: docId,
      userId: `seed_farmer_${i % 15}`,
      title: i % 3 === 0 ? `${n.nurseryName} approved your order` : i % 3 === 1 ? `New ${crops[i % crops.length].plantName} seedlings available near you` : `Your order ORD-DEMO-${1000 + i} has been dispatched`,
      type: ['order', 'crop', 'dispatch'][i % 3],
      read: i % 2 === 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    ops++;
    if (ops >= 400) {
      notifBatches.push(batch);
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) notifBatches.push(batch);
  for (const b of notifBatches) await b.commit();
  console.log('✅ 40 notifications seeded');

  // Messages (sample chats)
  const msgBatches = [];
  batch = db.batch();
  ops = 0;
  for (let i = 0; i < 20; i++) {
    const n = nurseries[i % nurseries.length];
    const chatId = `chat_seed_${i % 15}_${n.id}`;
    const docId = `msg_seed_${i}`;
    batch.set(db.collection('messages').doc(docId), {
      id: docId,
      chatId,
      from: i % 3 === 0 ? 'farmer' : 'nursery',
      text: i % 3 === 0 ? `Hi, is ${crops[i % crops.length].plantName} available in your nursery?` : `Yes, we have ${crops[i % crops.length].plantName} in stock. You can order now!`,
      senderId: i % 3 === 0 ? `seed_farmer_${i % 15}` : n.userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    ops++;
    if (ops >= 400) {
      msgBatches.push(batch);
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) msgBatches.push(batch);
  for (const b of msgBatches) await b.commit();
  console.log('✅ 20 sample messages seeded');

  // Recommendations
  const recBatch = db.batch();
  [['Tomato', 'Chilli', 'Brinjal'], ['Mango', 'Guava', 'Banana'], ['Spinach', 'Cabbage', 'Onion']].forEach((arr, i) => {
    recBatch.set(db.collection('recommendations').doc(`rec_seed_${i}`), {
      id: `rec_seed_${i}`,
      userId: `seed_farmer_${i}`,
      crops: arr,
      reason: `Recommended based on location (${DISTRICTS[i].name}), season, and soil type.`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  await recBatch.commit();
  console.log('✅ 3 recommendation sets seeded');

  console.log(`🎉 Seeding complete! ${nurseries.length} nurseries, ${crops.length} crops, ${reviewCount} reviews, ${orderCount} orders, ${wishCount} wishlist entries.`);
  return { nurseries: nurseries.length, crops: crops.length, reviews: reviewCount, orders: orderCount, wishlist: wishCount };
}

module.exports = { seedDatabase };

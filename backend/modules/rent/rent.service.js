// In-memory store for now — swap with a Mongoose model when ready
const rentProducts = [
  { id: 1, name: "Tractor",        pricePerDay: 1500, available: true, category: "heavy" },
  { id: 2, name: "Seed Drill",     pricePerDay: 600,  available: true, category: "seeding" },
  { id: 3, name: "Sprayer",        pricePerDay: 400,  available: true, category: "spraying" },
  { id: 4, name: "Power Tiller",   pricePerDay: 800,  available: true, category: "heavy" },
  { id: 5, name: "Harvester",      pricePerDay: 2000, available: true, category: "heavy" },
];

const orders = [];

exports.getAll = () => rentProducts.filter(p => p.available);

exports.placeOrder = (userId, productId, days) => {
  const product = rentProducts.find(p => p.id === productId);
  if (!product) throw new Error("Product not found");
  if (!product.available) throw new Error("Product not available");

  const order = {
    id: Date.now(),
    userId,
    productId,
    productName: product.name,
    days,
    totalCost: product.pricePerDay * days,
    status: "confirmed",
    createdAt: new Date(),
  };

  orders.push(order);
  return order;
};

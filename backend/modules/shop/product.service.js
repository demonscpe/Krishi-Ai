const Product = require("../../model/shop/product");

//
// Get all products with filters
//
exports.getAllProducts = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    minPrice,
    maxPrice,
    sort = "latest",
  } = query;

  const filter = { isAvailable: true };

  // 🔍 Search
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // 📂 Category filter
  if (category) {
    filter.category = category;
  }

  // 💰 Price filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // 🔃 Sorting
  let sortOption = {};
  if (sort === "latest") sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };

  const products = await Product.find(filter)
    .populate("category", "name")
    .populate("brand", "name")
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Product.countDocuments(filter);

  return {
    products,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

//
// Get single product
//
exports.getProductById = async (id) => {
  return await Product.findById(id).populate(
    "category brand variants"
  );
};
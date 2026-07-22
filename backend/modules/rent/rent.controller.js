const rentService = require("./rent.service");

exports.getProducts = (req, res) => {
  try {
    res.json(rentService.getAll());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.placeOrder = (req, res) => {
  try {
    const { productId, days } = req.body;
    if (!productId || !days) {
      return res.status(400).json({ message: "productId and days are required" });
    }
    const order = rentService.placeOrder(req.user.id, productId, days);
    res.status(201).json({ message: "Order placed", order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

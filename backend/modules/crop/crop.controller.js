const cropService = require("./crop.service");

exports.saveResult = async (req, res) => {
  try {
    const { inputs, prediction, confidence, alternatives, aiInsight } = req.body;
    if (!prediction || !inputs) {
      return res.status(400).json({ message: "inputs and prediction are required" });
    }
    const record = await cropService.saveResult(req.user.id, {
      inputs, prediction, confidence, alternatives, aiInsight,
    });
    res.status(201).json({ message: "Saved", record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await cropService.getHistory(req.user.id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteHistory = async (req, res) => {
  try {
    await cropService.deleteHistory(req.user.id, req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

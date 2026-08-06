const marketService = require("./market.service");

exports.quickLogin = async (req, res, next) => {
  try {
    const { role, name, phone } = req.body;
    const result = await marketService.quickAuth(role, name, phone);
    res.json({
      success: true,
      message: `Authenticated as ${result.user.role}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.loginAgent = async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone) {
      return res.status(400).json({ success: false, message: "Email or Phone is required" });
    }
    const result = await marketService.loginAgent(emailOrPhone, password);
    res.json({
      success: true,
      message: "Agent logged in successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.registerAgent = async (req, res, next) => {
  try {
    const result = await marketService.registerAgent(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPendingAgents = async (req, res, next) => {
  try {
    const pending = await marketService.getPendingAgents();
    res.json({
      success: true,
      data: pending,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyAgent = async (req, res, next) => {
  try {
    const { agentId, action } = req.body;
    if (!agentId) {
      return res.status(400).json({ success: false, message: "agentId is required" });
    }
    const result = await marketService.verifyAgent(agentId, action || "approved");
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAgentsList = async (req, res, next) => {
  try {
    const { mandiName } = req.query;
    const list = await marketService.getAgentsList(mandiName);
    res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPrices = async (req, res, next) => {
  try {
    const { cropName, agentId, mandiName } = req.query;
    const prices = await marketService.getLivePrices({ cropName, agentId, mandiName });
    res.json({
      success: true,
      count: prices.length,
      data: prices,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePrice = async (req, res, next) => {
  try {
    const { agentId, cropName, currentPrice, availableQtyKg, category, trend, mandiName } = req.body;
    const effectiveAgentId = agentId || (req.user ? req.user.id : null);

    if (!effectiveAgentId || !cropName || currentPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: agentId, cropName, currentPrice",
      });
    }

    const priceDoc = await marketService.updateLivePrice(
      effectiveAgentId,
      cropName,
      currentPrice,
      availableQtyKg,
      category,
      trend,
      mandiName
    );

    res.json({
      success: true,
      message: "Price updated successfully",
      data: priceDoc,
    });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const { cropName, mandiName } = req.query;
    const history = await marketService.getPriceHistory(cropName, mandiName);
    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

exports.getContracts = async (req, res, next) => {
  try {
    const { userId, role } = req.query;
    const effectiveUserId = userId || (req.user ? req.user.id : null);
    const effectiveRole = role || (req.user ? req.user.role : "farmer");

    if (!effectiveUserId) {
      return res.status(400).json({
        success: false,
        message: "userId query param or authenticated user required",
      });
    }

    const contracts = await marketService.getContracts(effectiveUserId, effectiveRole);
    res.json({
      success: true,
      data: contracts,
    });
  } catch (error) {
    next(error);
  }
};

exports.createContract = async (req, res, next) => {
  try {
    const { farmerId, agentId, cropName, quantityKg, lockedPricePerKg, mandiName, notes } = req.body;
    const effectiveFarmerId = farmerId || (req.user ? req.user.id : null);

    if (!effectiveFarmerId || !agentId || !cropName || !quantityKg || !lockedPricePerKg) {
      return res.status(400).json({
        success: false,
        message: "Missing required contract fields (farmerId, agentId, cropName, quantityKg, lockedPricePerKg)",
      });
    }

    const contract = await marketService.createContract(
      effectiveFarmerId,
      agentId,
      cropName,
      quantityKg,
      lockedPricePerKg,
      mandiName,
      notes
    );

    res.status(201).json({
      success: true,
      message: "Contract booked successfully",
      data: contract,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateContractStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status field is required",
      });
    }

    const updated = await marketService.updateContractStatus(id, status, notes);
    res.json({
      success: true,
      message: `Contract updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

exports.seedData = async (req, res, next) => {
  try {
    const result = await marketService.seedMarketData();
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

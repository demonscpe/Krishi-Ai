const express = require("express");
const router = express.Router();
const marketController = require("./market.controller");

// Auth & Agent Registration
router.post("/auth/quick-login", marketController.quickLogin);
router.post("/auth/agent-login", marketController.loginAgent);
router.post("/auth/register-agent", marketController.registerAgent);

// Agent Directory & Admin Verification
router.get("/agents", marketController.getAgentsList);
router.get("/pending-agents", marketController.getPendingAgents);
router.post("/admin/verify-agent", marketController.verifyAgent);

// Live Prices
router.get("/prices", marketController.getPrices);
router.post("/prices", marketController.updatePrice);

// Historical Price Analytics
router.get("/history", marketController.getHistory);

// Contracts & Finalization
router.get("/contracts", marketController.getContracts);
router.post("/contracts", marketController.createContract);
router.patch("/contracts/:id", marketController.updateContractStatus);

// Seed Data
router.post("/seed", marketController.seedData);

module.exports = router;

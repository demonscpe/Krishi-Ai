const crypto = require("crypto");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = () => crypto.randomBytes(32).toString("hex");

module.exports = { generateOTP, generateToken };

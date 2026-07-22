const jwt = require("jsonwebtoken");
const { secret, accessToken, refreshToken } = require("../../config/jwt");

// Generate Access Token
const generateAccessToken = (user) => {
  const id = user.id || user._id || (user.dataValues && user.dataValues.id);
  const role = user.role || (user.dataValues && user.dataValues.role);
  return jwt.sign({ id, role }, secret, accessToken);
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    secret,
    refreshToken
  );
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
};
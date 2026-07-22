const { JWT_SECRET } = require("./env");

module.exports = {
  secret: JWT_SECRET,
  accessToken:  { expiresIn: "7d" },
  refreshToken: { expiresIn: "30d" },
};

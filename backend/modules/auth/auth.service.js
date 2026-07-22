const User = require("../user/user.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("./auth.utils");

// Register User
exports.registerUser = async (data) => {
  const { email, firstName, lastName, username } = data;

  if (!username) {
    data.username = email.split("@")[0];
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    ...data,
    verificationToken,
    verificationTokenExpires: new Date(Date.now() + 3600000),
    isVerified: true,
  });

  return user;
};

// Login User
exports.loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");


  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};
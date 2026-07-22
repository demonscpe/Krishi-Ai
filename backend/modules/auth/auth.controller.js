const authService = require("./auth.service");
const { generateAccessToken } = require("./auth.utils");

// Register
exports.signup = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);

    res.status(201).json({
      message: "Registration successful. Verify your email.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login
exports.signin = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } =
      await authService.loginUser(
        req.body.email,
        req.body.password
      );

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Google OAuth success
exports.googleSuccess = (req, res) => {
  const token = generateAccessToken(req.user);

  res.redirect(
    `${process.env.FRONTEND_URL}/auth/success?token=${token}`
  );
};
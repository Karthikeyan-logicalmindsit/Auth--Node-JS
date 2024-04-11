const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendPasswordResetEmail } = require("../email");

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        message:
          "User with this email already exists, Please Choose Diffrent Email.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    console.log("User created successfully");
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(404).json({ message: "email or password not found" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );
    console.log("User Logged in Succesfully");
    res
      .status(200)
      .json({ message: "User logged in succesfully", accessToken });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.logout = (req, res) => {
  try {
    // if (!req.user) {
    //   return res.status(401).json({ message: "User not Logged in" });
    // }
    console.log("User logged out Succesfully");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("error logging out ", error.message);
    res.status(500).json({ message: "server error " });
  }
};

exports.forgetPasswordPage = (req, res) => {
  if (req.user) {
    return res.status(400).json({ message: "User already logged in" });
  }
  res.render("forgetPassword.ejs");
};

exports.resetPasswordPage = (req, res) => {
  const { email, token } = req.params;
  res.render("resetPassword.ejs", { email, token });
};

exports.resetPassword = async (req, res) => {
  try {
    // if (!req.user) {
    //   return res.status(401).json({ message: "User not logged in" });
    // }
    const { email, token, password } = req.body;

    const user = await User.findOne({ email });
    if (
      !user ||
      user.resetToken !== token ||
      user.resetTokenExpiration < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.generateResetToken = () => {
  return Math.random().toString(36).slice(2);
};

exports.forgetPassword = async (req, res) => {
  try {
    if (req.user) {
      return res.status(400).json({ message: "User already logged in" });
    }
    const { email } = req.body;
    console.log("Forget password request received for email:", email);
    if (!email || !email.trim()) {
      console.error("Email is required");
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    console.log("User found:", user);
    if (!user) {
      console.error("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = exports.generateResetToken();
    console.log("Generated reset token:", resetToken);

    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();
    console.log("Reset token saved for user:", user.email);

    await sendPasswordResetEmail(email, resetToken);
    console.log("Password reset email sent successfully");

    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

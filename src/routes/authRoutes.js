const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const authController = require("../controller/authController");

router.get("/protected_route", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Access granted", user });
  } catch (error) {
    console.error("Error in protected route:", error);
    res.status(500).json({ error: "Server Error" });
  }
});
router.get("/forget-password", authController.forgetPasswordPage);
router.get("/reset-password/:email/:token", authController.resetPasswordPage);

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forget-password", authController.forgetPassword);
router.post("/reset-password", authController.resetPassword);

router.post("/refresh-token", (req, res) => {
  try {
    const { accessToken } = req;
    if (!accessToken) {
      return res.status(401).json({ message: "Access token not provided" });
    }
    res.status(200).json({ accessToken });
    res.status(200).json({ message: "Refresh token succesfull" });
  } catch (error) {
    console.error("Error refreshing token ", error.message);
    res.status(500).json({ error: "Error refreshing token" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { email: 1, password: 1 });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error retrieving users:", error.message);
    res.status(500).json({ error: "Error retrieving users" });
  }
});

router.get("/", (req, res) => {
  res.send("Hello, World!");
});

router.get("/admin", (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to access this resource" });
    }
    console.log("Admin accessed the admin panel");
    res.status(200).json({ message: "Welcome to the admin panel!" });
  } catch (error) {
    console.error("Error accessing admin panel:", error.message);
    res.status(500).json({ error: error.message });
  }
});

//router.post("/logout",verifyToken, authController.logout);
router.post("/logout", (req, res) => {
  try {
    console.log("User logged out Successfully");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user-model");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.login(username, password);
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
});

router.delete("/delete-all", async (req, res) => {
  const { sid } = req.query;

  // Check if sid is provided and correct
  if (!sid || sid !== "7077") {
    return res
      .status(403)
      .json({ message: "Forbidden: Invalid or missing SID" });
  }

  try {
    const result = await User.deleteMany({});
    res.json({
      message: "All users deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting users", error });
  }
});

module.exports = router;

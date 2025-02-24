const CuttingUser = require("../models/thread-cutting-user-model");

// Create a new Cutting User
const createCuttingUser = async (req, res) => {
  try {
    const { cuttingUserName } = req.body;

    if (!cuttingUserName) {
      return res.status(400).json({ message: "Cutting user name is required" });
    }

    const newCuttingUser = new CuttingUser({ cuttingUserName });
    await newCuttingUser.save();

    res.status(201).json({ success: true, data: newCuttingUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Cutting Users sorted by name (A-Z)
const getAllCuttingUsers = async (req, res) => {
  try {
    const cuttingUsers = await CuttingUser.find().sort({ cuttingUserName: 1 });
    res.status(200).json({ success: true, data: cuttingUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Cutting User by ID
const getCuttingUserById = async (req, res) => {
  try {
    const cuttingUser = await CuttingUser.findById(req.params.id);
    if (!cuttingUser) {
      return res.status(404).json({ message: "Cutting user not found" });
    }
    res.status(200).json({ success: true, data: cuttingUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Cutting User
const updateCuttingUser = async (req, res) => {
  try {
    const updatedCuttingUser = await CuttingUser.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCuttingUser) {
      return res.status(404).json({ message: "Cutting user not found" });
    }

    res.status(200).json({ success: true, data: updatedCuttingUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Cutting User
const deleteCuttingUser = async (req, res) => {
  try {
    const deletedCuttingUser = await CuttingUser.findByIdAndDelete(
      req.params.id
    );

    if (!deletedCuttingUser) {
      return res.status(404).json({ message: "Cutting user not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Cutting user deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCuttingUser,
  getAllCuttingUsers,
  getCuttingUserById,
  updateCuttingUser,
  deleteCuttingUser,
};

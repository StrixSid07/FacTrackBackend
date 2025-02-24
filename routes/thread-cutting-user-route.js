const express = require("express");
const router = express.Router();
const {
  createCuttingUser,
  getAllCuttingUsers,
  getCuttingUserById,
  updateCuttingUser,
  deleteCuttingUser,
} = require("../controllers/thread-cutting-user-controller");

// Define Routes
router.post("/", createCuttingUser);      // Create Cutting User
router.get("/", getAllCuttingUsers);      // Get All Cutting Users
router.get("/:id", getCuttingUserById);   // Get Cutting User by ID
router.put("/:id", updateCuttingUser);    // Update Cutting User
router.delete("/:id", deleteCuttingUser); // Delete Cutting User

module.exports = router;

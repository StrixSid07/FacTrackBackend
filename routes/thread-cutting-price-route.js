const express = require("express");
const router = express.Router();
const {
  createThreadPrice,
  getAllThreadPrices,
  getThreadPriceById,
  updateThreadPrice,
  deleteThreadPrice,
} = require("../controllers/thread-cutting-price-controller");

// Define routes
router.post("/", createThreadPrice);
router.get("/", getAllThreadPrices);
router.get("/:id", getThreadPriceById);
router.put("/:id", updateThreadPrice);
router.delete("/:id", deleteThreadPrice);

module.exports = router;
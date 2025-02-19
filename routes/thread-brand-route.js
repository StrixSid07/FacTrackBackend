const express = require("express");
const router = express.Router();
const {
  createThreadBrand,
  getAllThreadBrands,
  getThreadBrandById,
  updateThreadBrand,
  deleteThreadBrand,
} = require("../controllers/thread-brand-controller");

// Define routes
router.post("/", createThreadBrand);
router.get("/", getAllThreadBrands);
router.get("/:id", getThreadBrandById);
router.put("/:id", updateThreadBrand);
router.delete("/:id", deleteThreadBrand);

module.exports = router;

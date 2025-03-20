const express = require("express");
const {
  createProduction,
  getAllProductions,
  getProductionById,
  updateProduction,
  deleteProduction,
} = require("../controllers/worker-production-controller");

const router = express.Router();

router.post("/", createProduction);
router.get("/", getAllProductions);
router.get("/:id", getProductionById);
router.put("/:id", updateProduction);
router.delete("/:id", deleteProduction);

module.exports = router;

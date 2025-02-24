const express = require("express");
const router = express.Router();
const { getMonthlyUserTotals } = require("../controllers/month-thread-cutting-count-controller");

// GET /api/month-thread-cutting-count?monthYear=YYYY-MM
router.get("/", getMonthlyUserTotals);

module.exports = router;

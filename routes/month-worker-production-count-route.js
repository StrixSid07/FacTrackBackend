const express = require("express");
const router = express.Router();
const {
  getMonthlySalary,
} = require("../controllers/month-work-production-count-controller");

// Example endpoint:
// GET /api/monthly-top-salary?month=2025-03&worker=<workerId>&machine=<machineId>
router.get("/", getMonthlySalary);

module.exports = router;

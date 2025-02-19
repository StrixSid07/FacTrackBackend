const express = require("express");
const { getMonthlyThreadCount } = require("../controllers/month-thread-count-controller");

const router = express.Router();

router.get("/", getMonthlyThreadCount);

module.exports = router;

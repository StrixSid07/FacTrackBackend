// routes/check-route.js
const express = require("express");
const router = express.Router();
const { createCheck, getCheck } = require("../controllers/check-controller");

router.post("/", createCheck);  // Create a check or update existing
router.get("/", getCheck);      // Get the check

module.exports = router;

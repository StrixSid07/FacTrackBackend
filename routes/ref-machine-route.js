const express = require("express");
const router = express.Router();
const {
  getMachinesByWorker,
} = require("../controllers/ref-machines-controller");

router.get("/", getMachinesByWorker);

module.exports = router;

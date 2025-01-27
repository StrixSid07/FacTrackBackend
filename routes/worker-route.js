const express = require("express");
const {
  createWorker,
  updateWorker,
  deleteWorker,
  getWorkers,
  getWorkerById
} = require("../controllers/worker-controller");
const router = express.Router();

router.post("/", createWorker);
router.put("/:id", updateWorker);
router.delete("/:id", deleteWorker);
router.get("/", getWorkers);
router.get("/:id", getWorkerById);

module.exports = router;

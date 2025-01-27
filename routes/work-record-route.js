const express = require("express");
const router = express.Router();
const {
  createWorkRecord,
  updateWorkRecord,
  deleteWorkRecord,
  getWorkRecords,
  getWorkRecordsByWorkerMachineMonth,
} = require("../controllers/work-record-controller");

router.post("/", createWorkRecord);
router.put("/:id", updateWorkRecord);
router.delete("/:id", deleteWorkRecord);
router.get("/", getWorkRecords);
router.get("/worker-machine-month", getWorkRecordsByWorkerMachineMonth);

module.exports = router;

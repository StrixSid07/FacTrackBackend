const express = require("express");
const router = express.Router();

const {
  createMachine,
  updateMachine,
  deleteMachine,
  getMachines,
  getMachineById,
  createMachineFrames,
  getMachineFrames,
  updateMachineFrames,
  deleteMachineFrames,
} = require("../controllers/machine-controller");

router.post("/", createMachine);
router.put("/:id", updateMachine);
router.delete("/:id", deleteMachine);
router.get("/", getMachines);
router.get("/:id", getMachineById);
router.get("/frames/:machineId/:month", getMachineFrames);
router.post("/frames", createMachineFrames);
router.put("/frames/:machineId/:month", updateMachineFrames);
router.delete("/frames/:machineId/:month", deleteMachineFrames);

module.exports = router;

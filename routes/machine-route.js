const express = require("express");
const router = express.Router();

const {
  createMachine,
  updateMachine,
  deleteMachine,
  getMachines,
  getMachineById,
} = require("../controllers/machine-controller");

router.post("/", createMachine);
router.put("/:id", updateMachine);
router.delete("/:id", deleteMachine);
router.get("/", getMachines);
router.get("/:id", getMachineById);

module.exports = router;

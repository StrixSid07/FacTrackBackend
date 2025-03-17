const mongoose = require("mongoose");
const Machine = require("./machine-model");

const MachineFrameSchema = new mongoose.Schema(
  {
    machineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      required: true,
      validate: {
        validator: async function (machineId) {
          const machine = await Machine.findById(machineId);
          return machine && machine.category === "Top";
        },
        message:
          "Frames can only be assigned to machines in the 'Top' category.",
      },
    },
    month: { type: String, required: true },
    frames: { type: Number, required: true },
  },
  { timestamps: true }
);

// Ensure machineId and month are unique together
MachineFrameSchema.index({ machineId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("MachineFrame", MachineFrameSchema);

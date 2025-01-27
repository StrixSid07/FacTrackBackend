const mongoose = require("mongoose");

const WorkRecordSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true,
  },
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Machine",
    required: true,
  },
  date: { type: Date, required: true },
  production: { type: Number, required: true },
  frames: { type: Number, required: true },
  total: { type: Number, required: true },
  salary: { type: Number, required: true },
  bonus: { type: Number, required: true },
  workShift: { type: String, enum: ["day", "night"], required: true },
});

module.exports = mongoose.model("WorkRecord", WorkRecordSchema);

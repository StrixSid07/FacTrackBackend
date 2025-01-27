const mongoose = require("mongoose");

const WorkerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  shift: { type: String, enum: ["Day", "Night"], required: true },
  leaveDates: [{ type: Date }],
});

module.exports = mongoose.model("Worker", WorkerSchema);

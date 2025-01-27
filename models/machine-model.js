const mongoose = require("mongoose");

const MachineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true, enum: ["Top", "Duppata"] },
  head: { type: Number, required: true },
});

module.exports = mongoose.model("Machine", MachineSchema);

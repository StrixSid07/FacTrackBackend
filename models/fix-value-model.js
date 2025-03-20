const mongoose = require("mongoose");

const fixValueSchema = new mongoose.Schema({
  month: { type: String, required: true }, // Format: YYYY-MM
  category: { type: String, required: true, enum: ["Top", "Duppata"] },
  fixSalCount: { type: Number, required: true },
});

module.exports = mongoose.model("FixValue", fixValueSchema);

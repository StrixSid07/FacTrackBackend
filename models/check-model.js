const mongoose = require("mongoose");

const CheckSchema = new mongoose.Schema({
  isChecked: {
    type: Boolean,
    required: true, 
    default: false,
  },
});

module.exports = mongoose.model("Check", CheckSchema);

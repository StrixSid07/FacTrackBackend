const mongoose = require("mongoose");

const WorkerProductionSchema = new mongoose.Schema({
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
  category: { type: String, required: true, enum: ["Top", "Duppata"] },
  production: {
    type: Number,
    required: function () {
      return this.category === "Top";
    },
  },
  frames: {
    type: [
      {
        production: { type: Number, required: true, default: 0 },
        frame: { type: Number, required: true, default: 0 },
      },
    ],
    validate: {
      validator: function (val) {
        return this.category === "Duppata" ? val.length <= 3 : val.length === 0;
      },
      message: "Duppata category should have up to 3 production-frame pairs.",
    },
  },
});

module.exports = mongoose.model("WorkerProduction", WorkerProductionSchema);

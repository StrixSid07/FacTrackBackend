const mongoose = require("mongoose");

const threadCuttingPriceSchema = new mongoose.Schema(
  {
    threadPriceName: {
      type: String,
      required: [true, "Thread price name is required"],
      trim: true,
      unique: true,
    },
    threadPrice: {
      type: Number,
      required: [true, "Thread price is required"],
      min: [0, "Price must be a positive number"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ThreadPrice", threadCuttingPriceSchema);

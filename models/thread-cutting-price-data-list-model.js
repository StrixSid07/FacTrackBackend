const mongoose = require("mongoose");

const dataListSchema = new mongoose.Schema(
  {
    cuttingUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CuttingUser",
      required: [true, "Cutting user is required"],
    },
    threadPrices: [
      {
        threadPrice: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ThreadPrice",
          required: [true, "Thread price is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ThreadCuttingDataList", dataListSchema);

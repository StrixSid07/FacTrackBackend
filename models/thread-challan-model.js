const mongoose = require("mongoose");

const threadChallanSchema = new mongoose.Schema(
  {
    challanNo: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ThreadBrand",
      required: true,
    },
    boxCount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to allow same challanNo across different companies but not within the same company
threadChallanSchema.index({ company: 1, challanNo: 1 }, { unique: true });

module.exports = mongoose.model("ThreadChallan", threadChallanSchema);

const mongoose = require("mongoose");

const subEntrySchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ThreadBrand",
    required: true,
  },
  boxCount: {
    type: Number,
    required: true,
  },
});

const threadChallanSchema = new mongoose.Schema(
  {
    challanNo: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      // This can represent the challan’s month/year (e.g. first day of the month)
      type: Date,
      required: true,
    },
    // This field holds the main brand – if the given company has a parent, use that,
    // otherwise, the company itself is the main brand.
    mainBrand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ThreadBrand",
      required: true,
    },
    // An array of entries for the sub-brands details.
    entries: {
      type: [subEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness at the main brand level for the same challanNo in a month.
threadChallanSchema.index(
  { mainBrand: 1, challanNo: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("ThreadChallan", threadChallanSchema);

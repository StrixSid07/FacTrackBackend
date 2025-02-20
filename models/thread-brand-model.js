const mongoose = require("mongoose");

const threadBrandSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      unique: true,
    },
    oneBoxPrice: {
      type: Number,
      required: [true, "Box price is required"],
      min: [0, "Price must be a positive number"],
    },
    parentBrand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ThreadBrand", // Reference to self for hierarchy
      default: null, // Null means it's a main brand
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ThreadBrand", threadBrandSchema);

const mongoose = require("mongoose");

const cuttingUserSchema = mongoose.Schema(
  {
    cuttingUserName: {
      type: String,
      required: [true, "Cutting user name is required"],
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("CuttingUser", cuttingUserSchema);

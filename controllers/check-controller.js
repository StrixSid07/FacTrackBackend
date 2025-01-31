const Check = require("../models/check-model"); // Assuming your model is in the models directory

exports.createCheck = async (req, res) => {
  try {
    let check = await Check.findOne();

    // Check if we already have a check document
    if (!check) {
      // Create a new check document if it doesn't exist
      check = await Check.create({ isChecked: req.body.isChecked || false });
      return res.status(201).json({ message: "Check created", data: check });
    } else {
      // Update the existing document with the new value for isChecked
      check.isChecked = req.body.isChecked || false;
      await check.save();
      return res.status(200).json({ message: "Check updated", data: check });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

exports.getCheck = async (req, res) => {
  try {
    const check = await Check.findOne();
    if (!check) {
      return res.status(404).json({ message: "Check not found" });
    }
    return res.status(200).json({ data: check });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

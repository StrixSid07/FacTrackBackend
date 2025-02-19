const FixValue = require("../models/fix-value-model");

// Get Fix Value (Return 0.0 if not found)
exports.getFixValue = async (req, res) => {
    try {
      const fixValue = await FixValue.findOne();
      if (!fixValue) {
        return res.json({ fixSalCount: 0.0 });
      }
      res.json(fixValue);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  
  // Create Fix Value (Prevent duplicate entries)
  exports.createFixValue = async (req, res) => {
    const { fixSalCount } = req.body;
  
    try {
      const existingFixValue = await FixValue.findOne();
      if (existingFixValue) {
        return res.status(400).json({ message: "Fix value already exists. You can only edit or delete it." });
      }
  
      const newFixValue = new FixValue({ fixSalCount });
      await newFixValue.save();
      res.status(201).json(newFixValue);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  
  // Update Fix Value
  exports.updateFixValue = async (req, res) => {
    const { fixSalCount } = req.body;
  
    try {
      const fixValue = await FixValue.findOne();
      if (!fixValue) {
        return res.status(404).json({ message: "Fix value not found" });
      }
  
      fixValue.fixSalCount = fixSalCount;
      await fixValue.save();
      res.json(fixValue);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  
  // Delete Fix Value
  exports.deleteFixValue = async (req, res) => {
    try {
      const fixValue = await FixValue.findOne();
      if (!fixValue) {
        return res.status(404).json({ message: "Fix value not found" });
      }
  
      await fixValue.deleteOne();
      res.json({ message: "Fix value deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
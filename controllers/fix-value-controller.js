const FixValue = require("../models/fix-value-model");
const moment = require("moment");

// Get Fix Value for a specific month & category
exports.getFixValue = async (req, res) => {
  try {
    const { category, month } = req.params;
    const currentMonth = month || moment().format("YYYY-MM");

    let fixValue = await FixValue.findOne({ category, month: currentMonth });

    if (!fixValue) {
      const lastMonth = moment(currentMonth, "YYYY-MM")
        .subtract(1, "month")
        .format("YYYY-MM");
      const prevFixValue = await FixValue.findOne({
        category,
        month: lastMonth,
      });

      if (prevFixValue) {
        fixValue = new FixValue({
          month: currentMonth,
          category,
          fixSalCount: prevFixValue.fixSalCount,
        });
        await fixValue.save();
      } else {
        return res.json({ fixSalCount: 0.0 });
      }
    }

    res.json(fixValue);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create Fix Value for a specific month & category
exports.createFixValue = async (req, res) => {
  try {
    const { fixSalCount, category } = req.body;
    if (!category || fixSalCount === undefined) {
      return res
        .status(400)
        .json({ message: "Category and fixSalCount are required" });
    }

    const currentMonth = moment().format("YYYY-MM");
    const existingFixValue = await FixValue.findOne({
      month: currentMonth,
      category,
    });

    if (existingFixValue) {
      return res
        .status(400)
        .json({ message: "Fix value already exists. Use update instead." });
    }

    const newFixValue = new FixValue({
      month: currentMonth,
      category,
      fixSalCount,
    });
    await newFixValue.save();

    res.status(201).json(newFixValue);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Fix Value for a specific month & category
exports.updateFixValue = async (req, res) => {
  try {
    const { fixSalCount } = req.body; // Category comes from params
    const { category } = req.params;

    if (!category || fixSalCount === undefined) {
      return res
        .status(400)
        .json({ message: "Category and fixSalCount are required" });
    }

    const currentMonth = moment().format("YYYY-MM");
    const fixValue = await FixValue.findOne({ month: currentMonth, category });

    if (!fixValue) {
      return res.status(404).json({ message: "Fix value not found" });
    }

    fixValue.fixSalCount = fixSalCount;
    await fixValue.save();

    res.json(fixValue);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Fix Value for a specific month & category
exports.deleteFixValue = async (req, res) => {
  try {
    const { category } = req.params;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const currentMonth = moment().format("YYYY-MM");
    const fixValue = await FixValue.findOne({ month: currentMonth, category });

    if (!fixValue) {
      return res.status(404).json({ message: "Fix value not found" });
    }

    await fixValue.deleteOne();
    res.json({ message: "Fix value deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const ThreadPrice = require("../models/thread-cutting-price-model");

// @desc    Create a new Thread Cutting Price
// @route   POST /api/thread-prices
const createThreadPrice = async (req, res) => {
  try {
    const { threadPriceName, threadPrice } = req.body;

    if (!threadPriceName || threadPrice == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (threadPrice < 0) {
      return res
        .status(400)
        .json({ message: "Thread price cannot be negative" });
    }

    const threadPriceEntry = await ThreadPrice.create({
      threadPriceName,
      threadPrice,
    });

    res.status(201).json({
      success: true,
      message: "Thread cutting price created successfully",
      data: threadPriceEntry,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Thread Cutting Prices
// @route   GET /api/thread-prices
const getAllThreadPrices = async (req, res) => {
  try {
    const threadPrices = await ThreadPrice.find().sort({ threadPrice: 1 }); // Sort by price in ascending order
    res.status(200).json({ success: true, data: threadPrices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single Thread Cutting Price by ID
// @route   GET /api/thread-prices/:id
const getThreadPriceById = async (req, res) => {
  try {
    const threadPrice = await ThreadPrice.findById(req.params.id);

    if (!threadPrice) {
      return res
        .status(404)
        .json({ message: "Thread cutting price not found" });
    }

    res.status(200).json({ success: true, data: threadPrice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a Thread Cutting Price
// @route   PUT /api/thread-prices/:id
const updateThreadPrice = async (req, res) => {
  try {
    const { threadPriceName, threadPrice } = req.body;

    if (threadPrice < 0) {
      return res
        .status(400)
        .json({ message: "Thread price cannot be negative" });
    }

    const updatedThreadPrice = await ThreadPrice.findByIdAndUpdate(
      req.params.id,
      { threadPriceName, threadPrice },
      { new: true, runValidators: true }
    );

    if (!updatedThreadPrice) {
      return res
        .status(404)
        .json({ message: "Thread cutting price not found" });
    }

    res.status(200).json({
      success: true,
      message: "Thread cutting price updated successfully",
      data: updatedThreadPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a Thread Cutting Price
// @route   DELETE /api/thread-prices/:id
const deleteThreadPrice = async (req, res) => {
  try {
    const deletedThreadPrice = await ThreadPrice.findByIdAndDelete(
      req.params.id
    );
    if (!deletedThreadPrice) {
      return res
        .status(404)
        .json({ message: "Thread cutting price not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Thread cutting price deleted successfully",
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createThreadPrice,
  getAllThreadPrices,
  getThreadPriceById,
  updateThreadPrice,
  deleteThreadPrice,
};

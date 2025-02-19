const ThreadBrand = require("../models/thread-brand-model");
const ThreadChallan = require("../models/thread-challan-model");

// @desc    Create a new Thread Brand
// @route   POST /api/thread-brands
// @access  Public
const createThreadBrand = async (req, res) => {
  try {
    const { companyName, oneBoxPrice } = req.body;

    if (!companyName || oneBoxPrice == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (oneBoxPrice < 0) {
      return res
        .status(400)
        .json({ message: "One Box Price cannot be negative" });
    }

    const threadBrand = await ThreadBrand.create({ companyName, oneBoxPrice });

    res.status(201).json({
      success: true,
      message: "Thread brand created successfully",
      data: threadBrand,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Thread Brands
// @route   GET /api/thread-brands
// @access  Public
const getAllThreadBrands = async (req, res) => {
  try {
    const threadBrands = await ThreadBrand.find().sort({ companyName: 1 }); // Sort by companyName in ascending order (A-Z)

    res.status(200).json({ success: true, data: threadBrands });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single Thread Brand
// @route   GET /api/thread-brands/:id
// @access  Public
const getThreadBrandById = async (req, res) => {
  try {
    const threadBrand = await ThreadBrand.findById(req.params.id);
    if (!threadBrand) {
      return res.status(404).json({ message: "Thread brand not found" });
    }
    res.status(200).json({ success: true, data: threadBrand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a Thread Brand
// @route   PUT /api/thread-brands/:id
// @access  Public
const updateThreadBrand = async (req, res) => {
  try {
    const { companyName, oneBoxPrice } = req.body;

    if (oneBoxPrice < 0) {
      return res
        .status(400)
        .json({ message: "One Box Price cannot be negative" });
    }

    const updatedThreadBrand = await ThreadBrand.findByIdAndUpdate(
      req.params.id,
      { companyName, oneBoxPrice },
      { new: true, runValidators: true }
    );

    if (!updatedThreadBrand) {
      return res.status(404).json({ message: "Thread brand not found" });
    }

    res.status(200).json({
      success: true,
      message: "Thread brand updated successfully",
      data: updatedThreadBrand,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a Thread Brand
// @route   DELETE /api/thread-brands/:id
// @access  Public
const deleteThreadBrand = async (req, res) => {
  try {
    const brandId = req.params.id;

    // Check if any ThreadChallan references this brand
    const existingChallan = await ThreadChallan.findOne({ company: brandId });

    if (existingChallan) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete. This brand is used in a challan.",
      });
    }

    // Proceed with deletion if not used
    const deletedThreadBrand = await ThreadBrand.findByIdAndDelete(brandId);
    if (!deletedThreadBrand) {
      return res.status(404).json({ message: "Thread brand not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Thread brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createThreadBrand,
  getAllThreadBrands,
  getThreadBrandById,
  updateThreadBrand,
  deleteThreadBrand,
};

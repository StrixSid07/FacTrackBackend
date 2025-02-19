const ThreadChallan = require("../models/thread-challan-model");
const ThreadBrand = require("../models/thread-brand-model");

// @desc    Create a new Thread Challan
// @route   POST /api/thread-challans
// @access  Public
const createThreadChallan = async (req, res) => {
  try {
    const { challanNo, date, company, boxCount } = req.body;

    if (!challanNo || !date || !company || boxCount == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the company exists
    const existingCompany = await ThreadBrand.findById(company);
    if (!existingCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Create a new Thread Challan
    const threadChallan = await ThreadChallan.create({
      challanNo,
      date,
      company,
      boxCount,
    });

    res.status(201).json({
      success: true,
      message: "Thread challan created successfully",
      data: threadChallan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Thread Challans
// @route   GET /api/thread-challans
// @access  Public
const getAllThreadChallans = async (req, res) => {
  try {
    const { monthYear } = req.query;

    if (!monthYear) {
      return res
        .status(400)
        .json({ success: false, message: "Month-Year is required." });
    }

    const [year, month] = monthYear.split("-");

    // Convert to numbers
    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    // Set filter to match the month and year
    const filter = {
      date: {
        $gte: new Date(yearInt, monthInt - 1, 1), // First day of the month
        $lt: new Date(yearInt, monthInt, 1), // First day of the next month
      },
    };

    // Fetch the challans with the filter applied
    const threadChallans = await ThreadChallan.find(filter)
      .populate("company", "companyName")
      .sort({ date: -1, challanNo: 1 }); // Sort by date (descending) and challanNo (ascending)

    // Group challans by date
    const groupedChallans = threadChallans.reduce((acc, challan) => {
      const dateKey = challan.date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(challan);
      return acc;
    }, {});

    res.status(200).json({ success: true, data: groupedChallans });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single Thread Challan
// @route   GET /api/thread-challans/:id
// @access  Public
const getThreadChallanById = async (req, res) => {
  try {
    const threadChallan = await ThreadChallan.findById(req.params.id).populate(
      "company",
      "companyName"
    );

    if (!threadChallan) {
      return res.status(404).json({ message: "Thread challan not found" });
    }

    res.status(200).json({ success: true, data: threadChallan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a Thread Challan
// @route   PUT /api/thread-challans/:id
// @access  Public
const updateThreadChallan = async (req, res) => {
  try {
    const { challanNo, date, company, boxCount } = req.body;

    if (!challanNo || !date || !company || boxCount == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the company exists
    const existingCompany = await ThreadBrand.findById(company);
    if (!existingCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    const updatedThreadChallan = await ThreadChallan.findByIdAndUpdate(
      req.params.id,
      { challanNo, date, company, boxCount },
      { new: true, runValidators: true }
    ).populate("company", "companyName");

    if (!updatedThreadChallan) {
      return res.status(404).json({ message: "Thread challan not found" });
    }

    res.status(200).json({
      success: true,
      message: "Thread challan updated successfully",
      data: updatedThreadChallan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a Thread Challan
// @route   DELETE /api/thread-challans/:id
// @access  Public
const deleteThreadChallan = async (req, res) => {
  try {
    const deletedThreadChallan = await ThreadChallan.findByIdAndDelete(
      req.params.id
    );

    if (!deletedThreadChallan) {
      return res.status(404).json({ message: "Thread challan not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Thread challan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createThreadChallan,
  getAllThreadChallans,
  getThreadChallanById,
  updateThreadChallan,
  deleteThreadChallan,
};

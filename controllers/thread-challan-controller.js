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
// Import your models at the top. Adjust the paths as needed.
const getAllThreadChallans = async (req, res) => {
  try {
    // Destructure query parameters; both company and parent are optional.
    const { monthYear, company, parent } = req.query;

    if (!monthYear) {
      return res
        .status(400)
        .json({ success: false, message: "Month-Year is required." });
    }

    const [year, month] = monthYear.split("-");
    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    // Build the date filter for the given month.
    const filter = {
      date: {
        $gte: new Date(yearInt, monthInt - 1, 1), // First day of the month
        $lt: new Date(yearInt, monthInt, 1), // First day of the next month
      },
    };

    // If a specific company (sub-brand) is provided, use it.
    if (company) {
      filter.company = company;
    }
    // Else, if a parent brand is provided, include the parent and its sub-brands.
    else if (parent) {
      const subCompanies = await ThreadBrand.find({ parentBrand: parent }).select(
        "_id"
      );
      const subCompanyIds = subCompanies.map((comp) => comp._id.toString());
      // Include the parent itself along with its sub-brands.
      filter.company = { $in: [parent, ...subCompanyIds] };
    }
    // If neither company nor parent is provided, the filter will only be based on monthYear.

    // Fetch the challans using the filter.
    const threadChallans = await ThreadChallan.find(filter)
      .populate("company", "companyName")
      .sort({ date: -1, challanNo: 1 });

    // Group challans by date (formatted as YYYY-MM-DD)
    const groupedChallans = threadChallans.reduce((acc, challan) => {
      const dateKey = challan.date.toISOString().split("T")[0];
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

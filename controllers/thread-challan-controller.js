const ThreadChallan = require("../models/thread-challan-model");
const ThreadBrand = require("../models/thread-brand-model");

// @desc    Create a new Thread Challan
// @route   POST /api/thread-challans
// @access  Public
// const createThreadChallan = async (req, res) => {
//   try {
//     const { challanNo, date, company, boxCount } = req.body;

//     if (!challanNo || !date || !company || boxCount == null) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Check if the company exists
//     const existingCompany = await ThreadBrand.findById(company);
//     if (!existingCompany) {
//       return res.status(404).json({ message: "Company not found" });
//     }

//     // Create a new Thread Challan
//     const threadChallan = await ThreadChallan.create({
//       challanNo,
//       date,
//       company,
//       boxCount,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Thread challan created successfully",
//       data: threadChallan,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const createThreadChallan = async (req, res) => {
  try {
    const { challanNo, date, entries } = req.body;

    // Validate that challanNo, date, and entries are provided and entries is a non-empty array
    if (
      !challanNo ||
      !date ||
      !entries ||
      !Array.isArray(entries) ||
      entries.length === 0
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Use the first entry to determine the main brand.
    const firstEntryCompanyId = entries[0].company;
    const existingCompany = await ThreadBrand.findById(firstEntryCompanyId);
    if (!existingCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Determine the main brand: use the parentBrand if available; otherwise, use the company itself.
    const mainBrand = existingCompany.parentBrand
      ? existingCompany.parentBrand.toString()
      : existingCompany._id.toString();

    // Parse the provided date.
    const challanDate = new Date(date);
    const year = challanDate.getFullYear();
    const month = challanDate.getMonth(); // 0-indexed

    // Calculate month boundaries for checking duplicates.
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 1);

    // Check if a master challan exists with the same challanNo, mainBrand, and within the same month.
    const existingChallanDoc = await ThreadChallan.findOne({
      challanNo,
      mainBrand,
      date: { $gte: startOfMonth, $lt: endOfMonth },
    });

    if (existingChallanDoc) {
      return res.status(400).json({
        success: false,
        message:
          "Challan already exists. Please use the update endpoint to modify the existing challan.",
      });
    } else {
      // To preserve the actual date you inserted, use challanDate (or date) here.
      const newChallanDoc = await ThreadChallan.create({
        challanNo,
        date: challanDate, // store the actual date provided
        mainBrand,
        entries,
      });
      return res.status(201).json({
        success: true,
        message: "Thread challan created successfully",
        data: newChallanDoc,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Thread Challans
// @route   GET /api/thread-challans
// @access  Public
// Import your models at the top. Adjust the paths as needed.
// const getAllThreadChallans = async (req, res) => {
//   try {
//     // Destructure query parameters; both company and parent are optional.
//     const { monthYear, company, parent } = req.query;

//     if (!monthYear) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Month-Year is required." });
//     }

//     const [year, month] = monthYear.split("-");
//     const monthInt = parseInt(month);
//     const yearInt = parseInt(year);

//     // Build the date filter for the given month.
//     const filter = {
//       date: {
//         $gte: new Date(yearInt, monthInt - 1, 1), // First day of the month
//         $lt: new Date(yearInt, monthInt, 1), // First day of the next month
//       },
//     };

//     // If a specific company (sub-brand) is provided, use it.
//     if (company) {
//       filter.company = company;
//     }
//     // Else, if a parent brand is provided, include the parent and its sub-brands.
//     else if (parent) {
//       const subCompanies = await ThreadBrand.find({
//         parentBrand: parent,
//       }).select("_id");
//       const subCompanyIds = subCompanies.map((comp) => comp._id.toString());
//       // Include the parent itself along with its sub-brands.
//       filter.company = { $in: [parent, ...subCompanyIds] };
//     }
//     // If neither company nor parent is provided, the filter will only be based on monthYear.

//     // Fetch the challans using the filter.
//     const threadChallans = await ThreadChallan.find(filter)
//       .populate("company", "companyName")
//       .sort({ date: -1, challanNo: 1 });

//     // Group challans by date (formatted as YYYY-MM-DD)
//     const groupedChallans = threadChallans.reduce((acc, challan) => {
//       const dateKey = challan.date.toISOString().split("T")[0];
//       if (!acc[dateKey]) {
//         acc[dateKey] = [];
//       }
//       acc[dateKey].push(challan);
//       return acc;
//     }, {});

//     res.status(200).json({ success: true, data: groupedChallans });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const getAllThreadChallans = async (req, res) => {
  try {
    const { monthYear, company, parent } = req.query;

    if (!monthYear) {
      return res
        .status(400)
        .json({ success: false, message: "Month-Year is required." });
    }

    const [year, month] = monthYear.split("-");
    const monthInt = parseInt(month);
    const yearInt = parseInt(year);
    const startOfMonth = new Date(yearInt, monthInt - 1, 1);
    const endOfMonth = new Date(yearInt, monthInt, 1);

    // Build filter on the master document's date field.
    const filter = {
      date: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    };

    // Optionally filter by company or parent.
    if (company) {
      // If filtering by a specific subbrand,
      // you could filter documents whose entries contain that company.
      filter["entries.company"] = company;
    } else if (parent) {
      // If a parent is provided, find all sub-companies and then filter.
      const subCompanies = await ThreadBrand.find({
        parentBrand: parent,
      }).select("_id");
      const subCompanyIds = subCompanies.map((comp) => comp._id.toString());
      filter["entries.company"] = { $in: subCompanyIds };
    }

    const threadChallans = await ThreadChallan.find(filter)
      .populate("mainBrand", "companyName")
      .populate("entries.company", "companyName oneBoxPrice")
      .sort({ challanNo: 1, date: -1 })
      .lean();

    threadChallans.forEach((challan) => {
      if (challan.entries && Array.isArray(challan.entries)) {
        challan.entries = challan.entries.map((entry) => ({
          ...entry,
          totalPrice: parseFloat(
            entry.boxCount * (entry.company?.oneBoxPrice || 0)
          ).toFixed(2),
        }));
      }
    });

    // Since each document is already a master for a challanNo,
    // you can return them directly (or further group by challanNo if needed).
    res.status(200).json({ success: true, data: threadChallans });
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
// const updateThreadChallan = async (req, res) => {
//   try {
//     const { challanNo, date, company, boxCount } = req.body;

//     if (!challanNo || !date || !company || boxCount == null) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Check if the company exists
//     const existingCompany = await ThreadBrand.findById(company);
//     if (!existingCompany) {
//       return res.status(404).json({ message: "Company not found" });
//     }

//     const updatedThreadChallan = await ThreadChallan.findByIdAndUpdate(
//       req.params.id,
//       { challanNo, date, company, boxCount },
//       { new: true, runValidators: true }
//     ).populate("company", "companyName");

//     if (!updatedThreadChallan) {
//       return res.status(404).json({ message: "Thread challan not found" });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Thread challan updated successfully",
//       data: updatedThreadChallan,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const updateThreadChallan = async (req, res) => {
  try {
    const { challanNo, date, entries } = req.body;

    // Validate required fields: challanNo, date, and a non-empty entries array.
    if (
      !challanNo ||
      !date ||
      !entries ||
      !Array.isArray(entries) ||
      entries.length === 0
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate each entry for required fields.
    for (const entry of entries) {
      if (!entry.company || entry.boxCount == null) {
        return res
          .status(400)
          .json({ message: "All entry fields are required" });
      }
    }

    // Use the first entry's company to determine the main brand.
    const existingCompany = await ThreadBrand.findById(entries[0].company);
    if (!existingCompany) {
      return res.status(404).json({ message: "Company not found" });
    }
    const mainBrand = existingCompany.parentBrand
      ? existingCompany.parentBrand.toString()
      : existingCompany._id.toString();

    // Update the document with the new challanNo, date, mainBrand and entries.
    const updatedThreadChallan = await ThreadChallan.findByIdAndUpdate(
      req.params.id,
      {
        challanNo,
        date,
        mainBrand,
        entries: entries.map((entry) => ({
          company: entry.company,
          boxCount: Number(entry.boxCount),
        })),
      },
      { new: true, runValidators: true }
    )
      .populate("mainBrand", "companyName")
      .populate("entries.company", "companyName");

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

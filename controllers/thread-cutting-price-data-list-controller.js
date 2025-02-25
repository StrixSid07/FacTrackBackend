const ThreadCuttingDataList = require("../models/thread-cutting-price-data-list-model");
const CuttingUser = require("../models/thread-cutting-user-model");
const ThreadPrice = require("../models/thread-cutting-price-model");

// @desc    Create a new Thread Cutting Data List
// @route   POST /api/thread-cutting-data-lists
// @access  Public
const createThreadCuttingDataList = async (req, res) => {
  try {
    const { cuttingUser, threadPrices, date } = req.body;

    if (!cuttingUser || !threadPrices || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the cutting user exists
    const existingUser = await CuttingUser.findById(cuttingUser);
    if (!existingUser) {
      return res.status(404).json({ message: "Cutting user not found" });
    }

    // Validate threadPrices array (must be non-empty)
    if (!Array.isArray(threadPrices) || threadPrices.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one thread price entry is required" });
    }

    // Optionally, validate each thread price entry
    for (const item of threadPrices) {
      if (!item.threadPrice || item.quantity == null) {
        return res.status(400).json({
          message:
            "Each thread price entry must include a threadPrice id and a quantity",
        });
      }

      // Check if data for the same user and date already exists
      const existingDataList = await ThreadCuttingDataList.findOne({
        cuttingUser,
        date: new Date(date),
      });
      if (existingDataList) {
        return res.status(400).json({
          message: "Data list for the selected user and date already exists",
        });
      }

      // Check if the referenced thread price exists
      const existingPrice = await ThreadPrice.findById(item.threadPrice);
      if (!existingPrice) {
        return res.status(404).json({
          message: `Thread price with id ${item.threadPrice} not found`,
        });
      }
    }

    // Create the new document
    const newDataList = await ThreadCuttingDataList.create({
      cuttingUser,
      threadPrices,
      date,
    });

    res.status(201).json({
      success: true,
      message: "Thread cutting data list created successfully",
      data: newDataList,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Thread Cutting Data Lists
// @route   GET /api/thread-cutting-data-lists
// @access  Public
// const getAllThreadCuttingDataLists = async (req, res) => {
//   try {
//     // Optional filters: monthYear (formatted as YYYY-MM) and cuttingUser
//     const { monthYear, cuttingUser } = req.query;
//     const filter = {};

//     if (monthYear) {
//       const [year, month] = monthYear.split("-");
//       const yearInt = parseInt(year, 10);
//       const monthInt = parseInt(month, 10);
//       filter.date = {
//         $gte: new Date(yearInt, monthInt - 1, 1),
//         $lt: new Date(yearInt, monthInt, 1),
//       };
//     }
//     if (cuttingUser) {
//       filter.cuttingUser = cuttingUser;
//     }

//     const dataLists = await ThreadCuttingDataList.find(filter)
//       .populate("cuttingUser", "cuttingUserName")
//       .populate("threadPrices.threadPrice", "threadPriceName threadPrice")
//       .sort({ date: -1 });

//     res.status(200).json({ success: true, data: dataLists });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// const getAllThreadCuttingDataLists = async (req, res) => {
//   try {
//     // Optional filters: monthYear (formatted as YYYY-MM) and cuttingUser
//     const { monthYear, cuttingUser } = req.query;
//     const filter = {};

//     if (monthYear) {
//       const [year, month] = monthYear.split("-");
//       const yearInt = parseInt(year, 10);
//       const monthInt = parseInt(month, 10);
//       filter.date = {
//         $gte: new Date(yearInt, monthInt - 1, 1),
//         $lt: new Date(yearInt, monthInt, 1),
//       };
//     }
//     if (cuttingUser) {
//       filter.cuttingUser = cuttingUser;
//     }

//     const dataLists = await ThreadCuttingDataList.find(filter)
//       .populate("cuttingUser", "cuttingUserName")
//       .populate("threadPrices.threadPrice", "threadPriceName threadPrice")
//       .sort({ date: -1 });

//     // Transform each data list item:
//     // - Convert Mongoose document to plain object.
//     // - For each threadPrices entry, compute a new field "computed" as (threadPrice * quantity).
//     const transformed = dataLists.map((item) => {
//       const obj = item.toObject();
//       obj.threadPrices = obj.threadPrices.map((tp) => {
//         const priceVal =
//           typeof tp.threadPrice === "object"
//             ? tp.threadPrice.threadPrice
//             : tp.threadPrice;
//         return {
//           ...tp,
//           computed: priceVal * tp.quantity,
//         };
//       });
//       return obj;
//     });

//     // Group transformed data by date (YYYY-MM-DD)
//     const grouped = {};
//     transformed.forEach((item) => {
//       const dateKey = new Date(item.date).toISOString().split("T")[0];
//       if (!grouped[dateKey]) {
//         grouped[dateKey] = [];
//       }
//       grouped[dateKey].push(item);
//     });

//     // For each group, compute total computed value (sum all computed values)
//     // and round it off to an integer.
//     const groupedWithTotals = Object.entries(grouped).map(([date, lists]) => {
//       const total = lists.reduce((sum, list) => {
//         const listSum = list.threadPrices.reduce((s, tp) => s + tp.computed, 0);
//         return sum + listSum;
//       }, 0);
//       return { date, lists, subtotal: Math.round(total) };
//     });

//     res.status(200).json({ success: true, data: groupedWithTotals });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const getAllThreadCuttingDataLists = async (req, res) => {
  try {
    // Optional filters: monthYear (formatted as YYYY-MM) and cuttingUser
    const { monthYear, cuttingUser } = req.query;
    const filter = {};

    if (monthYear) {
      const [year, month] = monthYear.split("-");
      const yearInt = parseInt(year, 10);
      const monthInt = parseInt(month, 10);
      filter.date = {
        $gte: new Date(yearInt, monthInt - 1, 1),
        $lt: new Date(yearInt, monthInt, 1),
      };
    }
    if (cuttingUser) {
      filter.cuttingUser = cuttingUser;
    }

    const dataLists = await ThreadCuttingDataList.find(filter)
      .populate("cuttingUser", "cuttingUserName")
      .populate("threadPrices.threadPrice", "threadPriceName threadPrice")
      // This sorts individual documents by date descending.
      .sort({ date: -1 });

    // Transform each data list item:
    // - Convert Mongoose document to plain object.
    // - For each threadPrices entry, compute a new field "computed" as (threadPrice * quantity).
    // - Also sort the threadPrices array by the threadPrice value in ascending order.
    const transformed = dataLists.map((item) => {
      const obj = item.toObject();
      obj.threadPrices = obj.threadPrices
        .map((tp) => {
          // Get the numeric value from the populated threadPrice
          const priceVal =
            typeof tp.threadPrice === "object"
              ? tp.threadPrice.threadPrice
              : tp.threadPrice;
          return { ...tp, computed: priceVal * tp.quantity };
        })
        .sort((a, b) => {
          const priceA =
            typeof a.threadPrice === "object"
              ? a.threadPrice.threadPrice
              : a.threadPrice;
          const priceB =
            typeof b.threadPrice === "object"
              ? b.threadPrice.threadPrice
              : b.threadPrice;
          return priceA - priceB;
        });
      return obj;
    });

    // Group transformed data by date (YYYY-MM-DD)
    const grouped = {};
    transformed.forEach((item) => {
      const dateKey = new Date(item.date).toISOString().split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    // For each group, compute total computed value (sum all computed values)
    // and round it off to an integer.
    const groupedWithTotals = Object.entries(grouped).map(([date, lists]) => {
      const total = lists.reduce((sum, list) => {
        const listSum = list.threadPrices.reduce((s, tp) => s + tp.computed, 0);
        return sum + listSum;
      }, 0);
      return { date, lists, subtotal: Math.round(total) };
    });

    // Sort the groups by date in descending order (latest date first)
    groupedWithTotals.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({ success: true, data: groupedWithTotals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single Thread Cutting Data List
// @route   GET /api/thread-cutting-data-lists/:id
// @access  Public
const getThreadCuttingDataListById = async (req, res) => {
  try {
    const dataList = await ThreadCuttingDataList.findById(req.params.id)
      .populate("cuttingUser", "cuttingUserName")
      .populate("threadPrices.threadPrice", "threadPriceName threadPrice");

    if (!dataList) {
      return res
        .status(404)
        .json({ message: "Thread cutting data list not found" });
    }

    res.status(200).json({ success: true, data: dataList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a Thread Cutting Data List
// @route   PUT /api/thread-cutting-data-lists/:id
// @access  Public
const updateThreadCuttingDataList = async (req, res) => {
  try {
    const { cuttingUser, threadPrices, date } = req.body;

    if (!cuttingUser || !threadPrices || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the cutting user exists
    const existingUser = await CuttingUser.findById(cuttingUser);
    if (!existingUser) {
      return res.status(404).json({ message: "Cutting user not found" });
    }

    // Validate threadPrices array
    if (!Array.isArray(threadPrices) || threadPrices.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one thread price entry is required" });
    }

    for (const item of threadPrices) {
      if (!item.threadPrice || item.quantity == null) {
        return res.status(400).json({
          message:
            "Each thread price entry must include a threadPrice id and a quantity",
        });
      }
      // Check if the referenced thread price exists
      const existingPrice = await ThreadPrice.findById(item.threadPrice);
      if (!existingPrice) {
        return res.status(404).json({
          message: `Thread price with id ${item.threadPrice} not found`,
        });
      }
    }

    const updatedDataList = await ThreadCuttingDataList.findByIdAndUpdate(
      req.params.id,
      { cuttingUser, threadPrices, date },
      { new: true, runValidators: true }
    )
      .populate("cuttingUser", "cuttingUserName")
      .populate("threadPrices.threadPrice", "threadPriceName threadPrice");

    if (!updatedDataList) {
      return res
        .status(404)
        .json({ message: "Thread cutting data list not found" });
    }

    res.status(200).json({
      success: true,
      message: "Thread cutting data list updated successfully",
      data: updatedDataList,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a Thread Cutting Data List
// @route   DELETE /api/thread-cutting-data-lists/:id
// @access  Public
const deleteThreadCuttingDataList = async (req, res) => {
  try {
    const deletedDataList = await ThreadCuttingDataList.findByIdAndDelete(
      req.params.id
    );

    if (!deletedDataList) {
      return res
        .status(404)
        .json({ message: "Thread cutting data list not found" });
    }

    res.status(200).json({
      success: true,
      message: "Thread cutting data list deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createThreadCuttingDataList,
  getAllThreadCuttingDataLists,
  getThreadCuttingDataListById,
  updateThreadCuttingDataList,
  deleteThreadCuttingDataList,
};

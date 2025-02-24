const ThreadCuttingDataList = require("../models/thread-cutting-price-data-list-model");

/**
 * @desc    Get monthly totals by cutting user:
 *          - For each user: total = sum of (threadPrice * quantity) from their threadPrices entries.
 *          - Overall total = sum of all user totals.
 *          - The users are sorted by cuttingUserName.
 * @route   GET /api/thread-cutting-user-totals?monthYear=YYYY-MM
 * @access  Public
 */
const getMonthlyUserTotals = async (req, res) => {
  try {
    const { monthYear } = req.query;

    if (!monthYear) {
      return res.status(400).json({
        success: false,
        message: "Month-Year is required in the format YYYY-MM.",
      });
    }

    const [year, month] = monthYear.split("-");
    const yearInt = parseInt(year, 10);
    const monthInt = parseInt(month, 10);

    // Calculate startDate (first day of month) and endDate (last day of month)
    const startDate = new Date(yearInt, monthInt - 1, 1);
    // Using new Date(year, month, 0) returns the last day of the given month.
    const endDate = new Date(yearInt, monthInt, 0, 23, 59, 59, 999);

    // Aggregation pipeline:
    const aggregationResult = await ThreadCuttingDataList.aggregate([
      // Filter documents for the selected month
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      // Unwind the threadPrices array to work with each entry separately
      { $unwind: "$threadPrices" },
      // Lookup the ThreadPrice details (assumes the collection is named "threadprices")
      {
        $lookup: {
          from: "threadprices",
          localField: "threadPrices.threadPrice",
          foreignField: "_id",
          as: "priceDetails",
        },
      },
      { $unwind: "$priceDetails" },
      // Compute the product of thread price and quantity
      {
        $addFields: {
          computed: {
            $multiply: ["$priceDetails.threadPrice", "$threadPrices.quantity"],
          },
        },
      },
      // Group by cuttingUser to sum the computed values per user
      {
        $group: {
          _id: "$cuttingUser",
          userTotal: { $sum: "$computed" },
        },
      },
      // Lookup the cutting user details (assumes the collection is named "cuttingusers")
      {
        $lookup: {
          from: "cuttingusers",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      // Project the desired fields
      {
        $project: {
          _id: 0,
          cuttingUserId: "$userDetails._id",
          cuttingUserName: "$userDetails.cuttingUserName",
          userTotal: 1,
        },
      },
      // Sort the results by cuttingUserName in ascending order
      {
        $sort: { cuttingUserName: 1 },
      },
      // Group all the results into a single document to compute the overall total
      {
        $group: {
          _id: null,
          users: { $push: "$$ROOT" },
          overallTotal: { $sum: "$userTotal" },
        },
      },
      {
        $project: {
          _id: 0,
          users: 1,
          overallTotal: 1,
        },
      },
    ]);

    // If no data was found, send an empty result with an overall total of 0
    if (!aggregationResult.length) {
      return res.status(200).json({
        success: true,
        data: { users: [], overallTotal: 0 },
      });
    }

    res.status(200).json({ success: true, data: aggregationResult[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMonthlyUserTotals };

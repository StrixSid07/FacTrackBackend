const ThreadChallan = require("../models/thread-challan-model");

const getMonthlyThreadCount = async (req, res) => {
  try {
    const { monthYear } = req.query;

    if (!monthYear) {
      return res
        .status(400)
        .json({ success: false, message: "Month-Year is required." });
    }

    const [year, month] = monthYear.split("-");
    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 0, 23, 59, 59, 999);

    const result = await ThreadChallan.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$company",
          totalBoxes: { $sum: "$boxCount" },
        },
      },
      {
        $lookup: {
          from: "threadbrands",
          localField: "_id",
          foreignField: "_id",
          as: "companyDetails",
        },
      },
      { $unwind: "$companyDetails" },
      {
        $project: {
          _id: 0,
          company: "$companyDetails.companyName",
          totalBoxes: 1,
          totalPrice: {
            $multiply: ["$totalBoxes", "$companyDetails.oneBoxPrice"],
          },
        },
      },
    ]);

    const overallTotalBoxes = result.reduce(
      (acc, brand) => acc + brand.totalBoxes,
      0
    );
    const overallTotalPrice = result.reduce(
      (acc, brand) => acc + brand.totalPrice,
      0
    );

    res.status(200).json({
      success: true,
      brands: result,
      overallTotalBoxes,
      overallTotalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMonthlyThreadCount };

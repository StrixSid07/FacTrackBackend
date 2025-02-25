const ThreadBrand = require("../models/thread-brand-model");
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

    // Step 1: Get the total count for each sub-brand
    const subBrandTotals = await ThreadChallan.aggregate([
      {
        $match: { date: { $gte: startDate, $lte: endDate } },
      },
      {
        $group: {
          _id: "$company", // Group by sub-brand
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
          companyId: "$companyDetails._id",
          companyName: "$companyDetails.companyName",
          parentBrand: "$companyDetails.parentBrand",
          totalBoxes: 1,
          oneBoxPrice: "$companyDetails.oneBoxPrice", // Price per box
        },
      },
    ]);

    // Step 2: Group sub-brands under main brands
    const mainBrandTotals = {};

    subBrandTotals.forEach((subBrand) => {
      const mainBrandId = subBrand.parentBrand || subBrand.companyId; // If no parent, it's a main brand

      if (!mainBrandTotals[mainBrandId]) {
        mainBrandTotals[mainBrandId] = {
          companyId: mainBrandId,
          companyName: subBrand.parentBrand
            ? "" // Leave empty for now; will be filled later
            : subBrand.companyName, // If main brand, use its name
          totalBoxes: 0,
          totalPrice: 0,
          subBrands: [],
        };
      }

      // Add sub-brand data
      if (subBrand.parentBrand) {
        mainBrandTotals[mainBrandId].subBrands.push({
          companyId: subBrand.companyId,
          companyName: subBrand.companyName,
          totalBoxes: subBrand.totalBoxes,
          totalPrice: subBrand.totalBoxes * subBrand.oneBoxPrice,
        });

        // Accumulate totals in main brand
        mainBrandTotals[mainBrandId].totalBoxes += subBrand.totalBoxes;
        mainBrandTotals[mainBrandId].totalPrice +=
          subBrand.totalBoxes * subBrand.oneBoxPrice;
      }
    });

    // Fetch main brand names (if they were skipped in aggregation)
    const mainBrandIds = Object.keys(mainBrandTotals);
    const mainBrandDetails = await ThreadBrand.find({
      _id: { $in: mainBrandIds },
    });

    mainBrandDetails.forEach((brand) => {
      if (mainBrandTotals[brand._id]) {
        mainBrandTotals[brand._id].companyName = brand.companyName;
      }
    });

    // Convert object to array and sort by companyName in ascending order
    const brandTotalsArray = Object.values(mainBrandTotals).sort((a, b) =>
      a.companyName.localeCompare(b.companyName)
    );

    // Calculate overall totals
    const overallTotalBoxes = brandTotalsArray.reduce(
      (acc, brand) => acc + brand.totalBoxes,
      0
    );
    const overallTotalPrice = brandTotalsArray.reduce(
      (acc, brand) => acc + brand.totalPrice,
      0
    );

    res.status(200).json({
      success: true,
      brands: brandTotalsArray,
      overallTotalBoxes,
      overallTotalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMonthlyThreadCount };

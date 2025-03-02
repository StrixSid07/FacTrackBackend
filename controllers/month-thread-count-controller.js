// const ThreadBrand = require("../models/thread-brand-model");
// const ThreadChallan = require("../models/thread-challan-model");

// const getMonthlyThreadCount = async (req, res) => {
//   try {
//     const { monthYear } = req.query;

//     if (!monthYear) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Month-Year is required." });
//     }

//     const [year, month] = monthYear.split("-");
//     const monthInt = parseInt(month);
//     const yearInt = parseInt(year);

//     const startDate = new Date(yearInt, monthInt - 1, 1);
//     const endDate = new Date(yearInt, monthInt, 0, 23, 59, 59, 999);

//     // Step 1: Get the total count for each sub-brand
//     const subBrandTotals = await ThreadChallan.aggregate([
//       {
//         $match: { date: { $gte: startDate, $lte: endDate } },
//       },
//       {
//         $group: {
//           _id: "$company", // Group by sub-brand
//           totalBoxes: { $sum: "$boxCount" },
//         },
//       },
//       {
//         $lookup: {
//           from: "threadbrands",
//           localField: "_id",
//           foreignField: "_id",
//           as: "companyDetails",
//         },
//       },
//       { $unwind: "$companyDetails" },
//       {
//         $project: {
//           _id: 0,
//           companyId: "$companyDetails._id",
//           companyName: "$companyDetails.companyName",
//           parentBrand: "$companyDetails.parentBrand",
//           totalBoxes: 1,
//           oneBoxPrice: "$companyDetails.oneBoxPrice", // Price per box
//         },
//       },
//     ]);

//     // Step 2: Group sub-brands under main brands
//     const mainBrandTotals = {};

//     subBrandTotals.forEach((subBrand) => {
//       const mainBrandId = subBrand.parentBrand || subBrand.companyId; // If no parent, it's a main brand

//       if (!mainBrandTotals[mainBrandId]) {
//         mainBrandTotals[mainBrandId] = {
//           companyId: mainBrandId,
//           companyName: subBrand.parentBrand
//             ? "" // Leave empty for now; will be filled later
//             : subBrand.companyName, // If main brand, use its name
//           totalBoxes: 0,
//           totalPrice: 0,
//           subBrands: [],
//         };
//       }

//       // Add sub-brand data
//       if (subBrand.parentBrand) {
//         const totalPrice = subBrand.totalBoxes * subBrand.oneBoxPrice;

//         mainBrandTotals[mainBrandId].subBrands.push({
//           companyId: subBrand.companyId,
//           companyName: subBrand.companyName,
//           totalBoxes: parseFloat(subBrand.totalBoxes.toFixed(2)),
//           totalPrice: parseFloat(totalPrice.toFixed(2)),
//         });

//         // Accumulate totals in main brand
//         mainBrandTotals[mainBrandId].totalBoxes += subBrand.totalBoxes;
//         mainBrandTotals[mainBrandId].totalPrice += totalPrice;
//       }
//     });

//     // Fetch main brand names (if they were skipped in aggregation)
//     const mainBrandIds = Object.keys(mainBrandTotals);
//     const mainBrandDetails = await ThreadBrand.find({
//       _id: { $in: mainBrandIds },
//     });

//     mainBrandDetails.forEach((brand) => {
//       if (mainBrandTotals[brand._id]) {
//         mainBrandTotals[brand._id].companyName = brand.companyName;
//       }
//     });

//     // Convert object to array and sort by companyName in ascending order
//     const brandTotalsArray = Object.values(mainBrandTotals)
//       .map((brand) => ({
//         ...brand,
//         totalBoxes: parseFloat(brand.totalBoxes.toFixed(2)),
//         totalPrice: parseFloat(brand.totalPrice.toFixed(2)),
//       }))
//       .sort((a, b) => a.companyName.localeCompare(b.companyName));

//     // Calculate overall totals
//     const overallTotalBoxes = brandTotalsArray.reduce(
//       (acc, brand) => acc + brand.totalBoxes,
//       0
//     );
//     const overallTotalPrice = brandTotalsArray.reduce(
//       (acc, brand) => acc + brand.totalPrice,
//       0
//     );

//     res.status(200).json({
//       success: true,
//       brands: brandTotalsArray,
//       overallTotalBoxes: parseFloat(overallTotalBoxes.toFixed(2)),
//       overallTotalPrice: parseFloat(overallTotalPrice.toFixed(2)),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = { getMonthlyThreadCount };

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
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    // Since we store each ThreadChallan document's date as the first day of the month,
    // we match documents with date >= startOfMonth and < endOfMonth.
    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 1);

    // Step 1: Aggregate totals for each sub-brand by unwinding the entries array.
    const subBrandTotals = await ThreadChallan.aggregate([
      { $match: { date: { $gte: startDate, $lt: endDate } } },
      { $unwind: "$entries" },
      {
        $group: {
          _id: "$entries.company", // Group by the company in each entry
          totalBoxes: { $sum: "$entries.boxCount" },
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

    // Step 2: Group sub-brands under main brands.
    const mainBrandTotals = {};

    subBrandTotals.forEach((subBrand) => {
      // Use the parentBrand if available; otherwise, this sub-brand is itself the main brand.
      const mainBrandId = subBrand.parentBrand || subBrand.companyId;

      if (!mainBrandTotals[mainBrandId]) {
        mainBrandTotals[mainBrandId] = {
          companyId: mainBrandId,
          companyName: subBrand.parentBrand ? "" : subBrand.companyName,
          totalBoxes: 0,
          totalPrice: 0,
          subBrands: [],
        };
      }

      // For sub-brands (i.e. those with a parentBrand), calculate total price.
      if (subBrand.parentBrand) {
        const totalPrice = subBrand.totalBoxes * subBrand.oneBoxPrice;

        mainBrandTotals[mainBrandId].subBrands.push({
          companyId: subBrand.companyId,
          companyName: subBrand.companyName,
          totalBoxes: parseFloat(subBrand.totalBoxes.toFixed(2)),
          totalPrice: parseFloat(totalPrice.toFixed(2)),
        });

        mainBrandTotals[mainBrandId].totalBoxes += subBrand.totalBoxes;
        mainBrandTotals[mainBrandId].totalPrice += totalPrice;
      }
    });

    // Fetch main brand names (in case some names were not set during aggregation)
    const mainBrandIds = Object.keys(mainBrandTotals);
    const mainBrandDetails = await ThreadBrand.find({
      _id: { $in: mainBrandIds },
    });

    mainBrandDetails.forEach((brand) => {
      if (mainBrandTotals[brand._id]) {
        mainBrandTotals[brand._id].companyName = brand.companyName;
      }
    });

    // Convert object to array and sort by companyName in ascending order.
    const brandTotalsArray = Object.values(mainBrandTotals)
      .map((brand) => ({
        ...brand,
        totalBoxes: parseFloat(brand.totalBoxes.toFixed(2)),
        totalPrice: parseFloat(brand.totalPrice.toFixed(2)),
      }))
      .sort((a, b) => a.companyName.localeCompare(b.companyName));

    // Calculate overall totals.
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
      overallTotalBoxes: parseFloat(overallTotalBoxes.toFixed(2)),
      overallTotalPrice: parseFloat(overallTotalPrice.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMonthlyThreadCount };

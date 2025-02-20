const ThreadBrand = require("../models/thread-brand-model");
const ThreadChallan = require("../models/thread-challan-model");

// @desc    Create a new Thread Brand (Supports Parent-Child Structure)
// @route   POST /api/thread-brands
const createThreadBrand = async (req, res) => {
  try {
    const { companyName, oneBoxPrice, parentBrand } = req.body;

    if (!companyName || oneBoxPrice == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (oneBoxPrice < 0) {
      return res
        .status(400)
        .json({ message: "One Box Price cannot be negative" });
    }

    // Check if parentBrand exists (only if provided)
    if (parentBrand) {
      const parentExists = await ThreadBrand.findById(parentBrand);
      if (!parentExists) {
        return res.status(400).json({ message: "Parent brand not found" });
      }
    }

    const threadBrand = await ThreadBrand.create({
      companyName,
      oneBoxPrice,
      parentBrand,
    });

    res.status(201).json({
      success: true,
      message: "Thread brand created successfully",
      data: threadBrand,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Thread Brands (Populates Parent Brands)
// @route   GET /api/thread-brands
// const getAllThreadBrands = async (req, res) => {
//   try {
//     const threadBrands = await ThreadBrand.find().populate("parentBrand", "companyName").sort({ companyName: 1 });

//     res.status(200).json({ success: true, data: threadBrands });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const getAllThreadBrands = async (req, res) => {
  try {
    // Fetch all brands and sort them by companyName initially.
    const threadBrands = await ThreadBrand.find()
      .populate("parentBrand", "companyName")
      .sort({ companyName: 1 });

    // Create a mapping from parent ID to an object holding the parent and its children.
    const brandMap = {};

    // Record all parent companies.
    threadBrands.forEach((brand) => {
      if (!brand.parentBrand) {
        // Use the parent's _id as key.
        brandMap[brand._id.toString()] = {
          parent: brand,
          children: [],
        };
      }
    });

    // Then, for each sub-brand, push it into its parent's children array.
    threadBrands.forEach((brand) => {
      if (brand.parentBrand) {
        const parentId = brand.parentBrand._id.toString();
        // If a parent entry does not exist (orphan child), we can initialize it.
        if (!brandMap[parentId]) {
          brandMap[parentId] = {
            parent: null,
            children: [],
          };
        }
        brandMap[parentId].children.push(brand);
      }
    });

    // Build the final flat sequence.
    const result = [];

    // Get an array of the parent groups sorted by the full parent companyName.
    const parentGroups = Object.values(brandMap)
      .filter((group) => group.parent) // only groups with a valid parent
      .sort((a, b) =>
        a.parent.companyName.localeCompare(b.parent.companyName, undefined, {
          sensitivity: "base",
        })
      );

    // For each parent group, push the parent followed by its sub-brands.
    parentGroups.forEach((group) => {
      // Push the parent first.
      result.push(group.parent);

      // Sort the children by their full companyName.
      const sortedChildren = group.children.sort((a, b) =>
        a.companyName.localeCompare(b.companyName, undefined, {
          sensitivity: "base",
        })
      );
      // Then push each sub-brand.
      sortedChildren.forEach((child) => result.push(child));
    });

    // If there are any orphan sub-brands (with no parent in the collection), add them at the end.
    const orphanChildren = Object.values(brandMap)
      .filter((group) => !group.parent)
      .flatMap((group) => group.children)
      .sort((a, b) =>
        a.companyName.localeCompare(b.companyName, undefined, {
          sensitivity: "base",
        })
      );
    orphanChildren.forEach((child) => result.push(child));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single Thread Brand (With Parent Info)
// @route   GET /api/thread-brands/:id
const getThreadBrandById = async (req, res) => {
  try {
    const threadBrand = await ThreadBrand.findById(req.params.id).populate(
      "parentBrand",
      "companyName"
    );

    if (!threadBrand) {
      return res.status(404).json({ message: "Thread brand not found" });
    }

    res.status(200).json({ success: true, data: threadBrand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a Thread Brand (Allows Changing Parent)
// @route   PUT /api/thread-brands/:id
const updateThreadBrand = async (req, res) => {
  try {
    const { companyName, oneBoxPrice, parentBrand } = req.body;

    if (oneBoxPrice < 0) {
      return res
        .status(400)
        .json({ message: "One Box Price cannot be negative" });
    }

    // Check if parentBrand exists (if provided)
    if (parentBrand) {
      const parentExists = await ThreadBrand.findById(parentBrand);
      if (!parentExists) {
        return res.status(400).json({ message: "Parent brand not found" });
      }
    }

    const updatedThreadBrand = await ThreadBrand.findByIdAndUpdate(
      req.params.id,
      { companyName, oneBoxPrice, parentBrand },
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

// @desc    Delete a Thread Brand (Prevents Deleting Brands with Sub-brands)
// @route   DELETE /api/thread-brands/:id
const deleteThreadBrand = async (req, res) => {
  try {
    const brandId = req.params.id;

    // Check if the brand has any sub-brands
    const subBrands = await ThreadBrand.findOne({ parentBrand: brandId });
    if (subBrands) {
      return res
        .status(400)
        .json({ message: "Cannot delete. This brand has sub-brands." });
    }

    // Check if any ThreadChallan references this brand
    const existingChallan = await ThreadChallan.findOne({ company: brandId });
    if (existingChallan) {
      return res
        .status(400)
        .json({ message: "Cannot delete. This brand is used in a challan." });
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

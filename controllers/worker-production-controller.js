const WorkerProduction = require("../models/worker-production-model");
const Worker = require("../models/worker-model");
const Machine = require("../models/machine-model");

// Utility function for error handling
const handleError = (res, error, message = "Something went wrong") => {
  console.error(error);
  res.status(500).json({ success: false, message, error: error.message });
};

// @desc    Create a new production record
// @route   POST /api/worker-production
// @access  Public
exports.createProduction = async (req, res) => {
  try {
    const { workerId, machineId, date, production, frames } = req.body;

    // Check if Worker and Machine exist
    const worker = await Worker.findById(workerId);
    if (!worker)
      return res
        .status(404)
        .json({ success: false, message: "Worker not found" });

    const machine = await Machine.findById(machineId);
    if (!machine)
      return res
        .status(404)
        .json({ success: false, message: "Machine not found" });

    // Convert the incoming date to UTC
    const startOfDay = new Date(date + "T00:00:00Z"); // Treat as UTC

    // Check if a record already exists for the same worker, machine, and date
    const existingProduction = await WorkerProduction.findOne({
      worker: workerId,
      machine: machineId,
      date: {
        $gte: startOfDay,
        $lt: new Date(startOfDay.getTime() + 86400000), // Check for the same day
      },
    })
      .populate("worker", "name") // Populate worker name
      .populate("machine", "name"); // Populate machine name

    if (existingProduction) {
      return res.status(400).json({
        success: false,
        message: `A production record for worker ${
          existingProduction.worker.name
        } on machine ${existingProduction.machine.name} for ${
          startOfDay.toISOString().split("T")[0]
        } already exists. Please update the existing record if needed.`,
      });
    }

    // Validate category-specific fields
    const productionData = {
      worker: workerId,
      machine: machineId,
      date: startOfDay,
      category: machine.category,
    };

    if (machine.category === "Top") {
      if (typeof production !== "number") {
        return res.status(400).json({
          success: false,
          message: "Production is required for Top category",
        });
      }
      productionData.production = production;
    } else {
      if (!Array.isArray(frames) || frames.length === 0 || frames.length > 3) {
        return res.status(400).json({
          success: false,
          message: "Frames must be an array with up to 3 entries",
        });
      }
      productionData.frames = frames;
    }

    // Create and save record
    const newProduction = new WorkerProduction(productionData);
    await newProduction.save();

    res.status(201).json({
      success: true,
      message: "Production record created",
      data: newProduction,
    });
  } catch (error) {
    handleError(res, error, "Error creating production record");
  }
};

// @desc    Get all production records with filtering by month-year, worker, and machine
// @route   GET /api/worker-production
// @access  Public
exports.getAllProductions = async (req, res) => {
  try {
    let { monthYear, workerId, machineId } = req.query;
    let filter = {};

    // If monthYear is provided, filter records based on the selected month and year
    if (monthYear) {
      const [year, month] = monthYear.split("-").map(Number);
      if (!year || !month) {
        return res.status(400).json({
          success: false,
          message: "Invalid monthYear format. Use YYYY-MM (e.g., 2024-03)",
        });
      }

      const startDate = new Date(year, month - 1, 1); // First day of the month
      const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month

      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Filter by worker if provided
    if (workerId) {
      filter.worker = workerId;
    }

    // Filter by machine if provided
    if (machineId) {
      filter.machine = machineId;
    }

    // Fetch records with filters and sort by date descending (latest first)
    const productions = await WorkerProduction.find(filter)
      .populate("worker machine")
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: productions });
  } catch (error) {
    handleError(res, error, "Error fetching production records");
  }
};

// @desc    Get a single production record by ID
// @route   GET /api/worker-production/:id
// @access  Public
exports.getProductionById = async (req, res) => {
  try {
    const production = await WorkerProduction.findById(req.params.id).populate(
      "worker machine"
    );
    if (!production)
      return res
        .status(404)
        .json({ success: false, message: "Production record not found" });

    res.status(200).json({ success: true, data: production });
  } catch (error) {
    handleError(res, error, "Error fetching production record");
  }
};
// @desc    Update a production record
// @route   PUT /api/worker-production/:id
// @access  Public
exports.updateProduction = async (req, res) => {
  try {
    const { production, frames, workerId, machineId } = req.body;

    // Find the production record
    const productionRecord = await WorkerProduction.findById(req.params.id)
      .populate("worker", "name")
      .populate("machine", "name category");

    if (!productionRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Production record not found" });
    }

    // If worker or machine is being updated, validate existence
    if (workerId && workerId !== String(productionRecord.worker._id)) {
      const worker = await Worker.findById(workerId);
      if (!worker) {
        return res
          .status(404)
          .json({ success: false, message: "Worker not found" });
      }
      productionRecord.worker = workerId;
    }

    if (machineId && machineId !== String(productionRecord.machine._id)) {
      const machine = await Machine.findById(machineId);
      if (!machine) {
        return res
          .status(404)
          .json({ success: false, message: "Machine not found" });
      }
      productionRecord.machine = machineId;
      productionRecord.category = machine.category; // Update category if machine changes
    }

    // Validate category-specific fields
    if (productionRecord.category === "Top") {
      if (typeof production !== "number") {
        return res.status(400).json({
          success: false,
          message: "Production must be a number for Top category",
        });
      }
      productionRecord.production = production;
      productionRecord.frames = undefined; // Ensure frames are cleared if switching category
    } else {
      if (!Array.isArray(frames) || frames.length === 0 || frames.length > 3) {
        return res.status(400).json({
          success: false,
          message: "Frames must be an array with up to 3 entries",
        });
      }
      productionRecord.frames = frames;
      productionRecord.production = undefined; // Ensure production is cleared if switching category
    }

    await productionRecord.save();
    res.status(200).json({
      success: true,
      message: "Production record updated successfully",
      data: productionRecord,
    });
  } catch (error) {
    handleError(res, error, "Error updating production record");
  }
};

// @desc    Delete a production record
// @route   DELETE /api/worker-production/:id
// @access  Public
exports.deleteProduction = async (req, res) => {
  try {
    const productionRecord = await WorkerProduction.findByIdAndDelete(
      req.params.id
    );
    if (!productionRecord)
      return res
        .status(404)
        .json({ success: false, message: "Production record not found" });

    res
      .status(200)
      .json({ success: true, message: "Production record deleted" });
  } catch (error) {
    handleError(res, error, "Error deleting production record");
  }
};

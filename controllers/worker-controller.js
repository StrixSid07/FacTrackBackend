const WorkerProduction = require("../models/worker-production-model");
const Worker = require("../models/worker-model");

exports.createWorker = async (req, res) => {
  const { name, shift, leaveDates } = req.body;

  // Validate input
  if (!name || !shift) {
    return res.status(400).json({ message: "Name and shift are required." });
  }

  try {
    const newWorker = await Worker.create({
      name,
      shift,
      leaveDates,
    });

    res.status(201).json({
      success: true,
      data: newWorker,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `A worker with the name "${name}" already exists.`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error. Unable to create worker.",
      error: error.message,
    });
  }
};

exports.updateWorker = async (req, res) => {
  const { id } = req.params;
  const { name, shift, leaveDates } = req.body;

  try {
    if (name) {
      const existingWorker = await Worker.findOne({ name, _id: { $ne: id } });
      if (existingWorker) {
        return res.status(400).json({
          success: false,
          message: `A worker with the name "${name}" already exists.`,
        });
      }
    }

    const updatedWorker = await Worker.findByIdAndUpdate(
      id,
      { name, shift, leaveDates },
      { new: true, runValidators: true }
    );

    if (!updatedWorker) {
      return res.status(404).json({
        success: false,
        message: `Worker with ID ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: updatedWorker,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to update worker.",
      error: error.message,
    });
  }
};

exports.deleteWorker = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the worker details
    const worker = await Worker.findById(id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found.",
      });
    }

    // Check if the worker is involved in any production calculations
    const isWorkerInUse = await WorkerProduction.findOne({ worker: id });

    if (isWorkerInUse) {
      return res.status(400).json({
        success: false,
        message: `The worker "${worker.name}" is currently involved in production calculations. You cannot delete them, but you can modify their details if needed.`,
      });
    }

    // Proceed with deletion if not in use
    await Worker.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Worker "${worker.name}" deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to delete worker.",
      error: error.message,
    });
  }
};

exports.getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find();

    res.status(200).json({
      success: true,
      count: workers.length,
      data: workers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to fetch workers.",
      error: error.message,
    });
  }
};

exports.getWorkerById = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL params
    const worker = await Worker.findById(id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: `Worker not found with id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: worker,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to fetch the worker.",
      error: error.message,
    });
  }
};

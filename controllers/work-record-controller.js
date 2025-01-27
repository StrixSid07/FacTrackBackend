const WorkRecord = require("../models/work-record-model");
const Worker = require("../models/worker-model");
const Machine = require("../models/machine-model");

// Create a new work record
exports.createWorkRecord = async (req, res) => {
  const { worker, machine, date, production, frames } = req.body;

  try {
    // Validate worker and machine IDs
    const workerExists = await Worker.findById(worker);
    const machineExists = await Machine.findById(machine);

    if (!workerExists || !machineExists) {
      return res.status(404).json({
        success: false,
        message: "Worker or Machine not found.",
      });
    }

    // Fetch machine details for additional calculations
    const { category, head } = machineExists;

    // Frame Calculation based on machine category and head
    let calculatedFrames = frames;
    if (category === "Top" && head < 26) {
      calculatedFrames = 300; // Fixed frames for top category machines
    } else if (category === "Top" && head >= 27) {
      calculatedFrames = 280; // Fixed frames if head >= 27
    } else {
      calculatedFrames = production;
      // Default frames based on production
    }

    // Automatic Calculations
    let bonus = 0;
    let salary = 0;

    // Bonus and Salary Calculation
    if (head <= 27) {
      if (production >= 280) {
        bonus = 100;
        salary = 400; // Fixed salary if production >= 280 for head <= 27
      } else {
        bonus = 0;
        salary = Math.round(production * 1.5); // Salary based on production
      }
    } else {
      if (production >= 300) {
        bonus = 100;
        salary = 400; // Fixed salary if production >= 300 for head < 27
      } else {
        bonus = 0;
        salary = Math.round(production * 1.5); // Salary based on production
      }
    }

    // Total Calculation
    const total = Math.round(production * 0.6 + calculatedFrames * 0.4); // Adjust percentages as needed

    // Create new work record
    const newWorkRecord = await WorkRecord.create({
      worker,
      machine,
      date,
      production,
      frames: calculatedFrames,
      total,
      salary,
      bonus,
      workShift: req.body.workShift, // Ensure workShift is passed in the request body
    });

    res.status(201).json({
      success: true,
      data: newWorkRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to create work record.",
      error: error.message,
    });
  }
};

// exports.createWorkRecord = async (req, res) => {
//   const {
//     worker,
//     machine,
//     date,
//     production,
//     frames,
//     total,
//     salary,
//     bonus,
//     workShift,
//   } = req.body;

//   try {
//     // Validate worker and machine IDs
//     const workerExists = await Worker.findById(worker);
//     const machineExists = await Machine.findById(machine);

//     if (!workerExists || !machineExists) {
//       return res.status(404).json({
//         success: false,
//         message: "Worker or Machine not found.",
//       });
//     }

//     // Create new work record
//     const newWorkRecord = await WorkRecord.create({
//       worker,
//       machine,
//       date,
//       production,
//       frames,
//       total,
//       salary,
//       bonus,
//       workShift,
//     });

//     res.status(201).json({
//       success: true,
//       data: newWorkRecord,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server error. Unable to create work record.",
//       error: error.message,
//     });
//   }
// };

// Update work record

exports.updateWorkRecord = async (req, res) => {
  const { id } = req.params; // Work record ID from the URL
  const {
    worker,
    machine,
    date,
    production,
    frames,
    total,
    salary,
    bonus,
    workShift,
  } = req.body;

  try {
    // Check if the work record exists
    const existingRecord = await WorkRecord.findById(id);
    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: `Work record with ID ${id} not found.`,
      });
    }

    // Validate worker and machine if provided
    if (worker) {
      const workerExists = await Worker.findById(worker);
      if (!workerExists) {
        return res.status(404).json({
          success: false,
          message: `Worker with ID ${worker} not found.`,
        });
      }
    }

    if (machine) {
      const machineExists = await Machine.findById(machine);
      if (!machineExists) {
        return res.status(404).json({
          success: false,
          message: `Machine with ID ${machine} not found.`,
        });
      }
    }

    // Update the work record
    const updatedWorkRecord = await WorkRecord.findByIdAndUpdate(
      id,
      {
        worker,
        machine,
        date,
        production,
        frames,
        total,
        salary,
        bonus,
        workShift,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedWorkRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to update work record.",
      error: error.message,
    });
  }
};

// Delete a work record
exports.deleteWorkRecord = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedWorkRecord = await WorkRecord.findByIdAndDelete(id);

    if (!deletedWorkRecord) {
      return res.status(404).json({
        success: false,
        message: `Work record with ID ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Work record deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to delete work record.",
      error: error.message,
    });
  }
};

// Fetch all work records
exports.getWorkRecords = async (req, res) => {
  try {
    const workRecords = await WorkRecord.find()
      .populate("worker", "name shift")
      .populate("machine", "name category");

    res.status(200).json({
      success: true,
      count: workRecords.length,
      data: workRecords,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to fetch work records.",
      error: error.message,
    });
  }
};

// Fetch work records by worker ID, machine ID, and month
exports.getWorkRecordsByWorkerMachineMonth = async (req, res) => {
  const { workerId, machineId, month } = req.query; // Extract the query parameters

  try {
    // Check if month is in a valid format (e.g., YYYY-MM)
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format. Please use YYYY-MM.",
      });
    }

    // Parse the month and extract the year and month parts
    const [year, monthNumber] = month.split("-");

    // Find work records based on worker, machine, and month
    const workRecords = await WorkRecord.find({
      worker: workerId,
      machine: machineId,
      date: {
        $gte: new Date(`${year}-${monthNumber}-01`), // Start of the month
        $lt: new Date(`${year}-${parseInt(monthNumber) + 1}-01`), // Start of next month
      },
    })
      .populate("worker", "name shift")
      .populate("machine", "name category");

    if (workRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No work records found for the specified worker, machine, and month.",
      });
    }

    res.status(200).json({
      success: true,
      count: workRecords.length,
      data: workRecords,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to fetch work records.",
      error: error.message,
    });
  }
};

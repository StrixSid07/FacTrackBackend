const WorkRecord = require("../models/work-record-model");
const Worker = require("../models/worker-model");
const Machine = require("../models/machine-model");

// Get machines by worker or all machines from work records
exports.getMachinesByWorker = async (req, res) => {
  const { workerId } = req.query;

  try {
    // Build query
    const query = workerId ? { worker: workerId } : {};

    // Fetch work records and populate machine references
    const workRecords = await WorkRecord.find(query).populate("machine");

    // Extract unique machines
    const machines = [];
    const machineSet = new Set();

    workRecords.forEach((record) => {
      const machine = record.machine;
      if (machine && !machineSet.has(machine._id.toString())) {
        machineSet.add(machine._id.toString());
        machines.push(machine); // Add unique machines
      }
    });

    res.status(200).json({
      success: true,
      data: machines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to fetch machines.",
      error: error.message,
    });
  }
};

const MachineFrame = require("../models/machine-frame-model");
const Machine = require("../models/machine-model");

exports.createMachine = async (req, res) => {
  const { name, category, head } = req.body;

  // Validate input
  if (!name || !category || !head) {
    return res
      .status(400)
      .json({ message: "Name, category and head are required." });
  }

  // Validate category value
  if (!["Top", "Duppata"].includes(category)) {
    return res
      .status(400)
      .json({ message: "Invalid category. Use 'Top' or 'Duppata'." });
  }

  try {
    const newMachine = await Machine.create({
      name,
      category,
      head,
    });

    res.status(201).json({
      success: true,
      data: newMachine,
    });
  } catch (error) {
    // Handle duplicate name error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `A machine with the name "${name}" already exists.`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error. Unable to create machine.",
      error: error.message,
    });
  }
};

exports.updateMachine = async (req, res) => {
  const { id } = req.params;
  const { name, category, head } = req.body;

  // Validate category if provided
  if (category && !["Top", "Duppata"].includes(category)) {
    return res
      .status(400)
      .json({ message: "Invalid category. Use 'Top' or 'Duppata'." });
  }

  try {
    const updatedMachine = await Machine.findByIdAndUpdate(
      id,
      { name, category, head },
      { new: true, runValidators: true }
    );

    if (!updatedMachine) {
      return res.status(404).json({
        success: false,
        message: `Machine with ID ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: updatedMachine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to update machine.",
      error: error.message,
    });
  }
};

exports.deleteMachine = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMachine = await Machine.findByIdAndDelete(id);

    if (!deletedMachine) {
      return res.status(404).json({
        success: false,
        message: `Machine with ID ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Machine deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to delete machine.",
      error: error.message,
    });
  }
};

exports.getMachines = async (req, res) => {
  try {
    const machines = await Machine.find();

    res.status(200).json({
      success: true,
      count: machines.length,
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

exports.getMachineById = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL params
    const machine = await Machine.findById(id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: `Machine not found with id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: machine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to fetch the machine.",
      error: error.message,
    });
  }
};

exports.createMachineFrames = async (req, res) => {
  const { machineId, month, frames } = req.body;

  try {
    // Fetch the machine to check its category
    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({
        success: false,
        message: `Machine with ID ${machineId} not found.`,
      });
    }

    if (machine.category !== "Top") {
      return res.status(400).json({
        success: false,
        message:
          "Frames can only be assigned to machines in the 'Top' category.",
      });
    }

    // Create the frame record
    const newFrame = await MachineFrame.create({ machineId, month, frames });

    res.status(201).json({
      success: true,
      data: newFrame,
      message: "Frames created successfully.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Frames for this machine and month already exist.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error. Unable to create frames.",
      error: error.message,
    });
  }
};

exports.getMachineFrames = async (req, res) => {
  const { machineId, month } = req.params;

  try {
    let machineFrames = await MachineFrame.findOne({ machineId, month });
    if (!machineFrames) {
      // Compute the previous month (handle year boundary)
      const [year, mon] = month.split("-").map(Number);
      let prevYear = year;
      let prevMon = mon - 1;
      if (prevMon < 1) {
        prevMon = 12;
        prevYear = year - 1;
      }
      const previousMonthStr = `${prevYear}-${String(prevMon).padStart(
        2,
        "0"
      )}`;

      // Try to fetch the previous month's record
      const previousRecord = await MachineFrame.findOne({
        machineId,
        month: previousMonthStr,
      });

      if (previousRecord) {
        // Create a new record for the current month with the same frame value
        machineFrames = await MachineFrame.create({
          machineId,
          month,
          frames: previousRecord.frames,
        });
      } else {
        // No record exists for the current month or the previous month
        return res.status(200).json({
          success: true,
          data: null,
          message: `No frames found for machine ${machineId} in ${month}, and no previous data available.`,
        });
      }
    }

    res.status(200).json({ success: true, data: machineFrames });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to fetch frames.",
      error: error.message,
    });
  }
};

exports.updateMachineFrames = async (req, res) => {
  const { machineId, month } = req.params;
  const { frames } = req.body;

  try {
    const frameRecord = await MachineFrame.findOne({ machineId, month });

    if (!frameRecord) {
      return res.status(404).json({
        success: false,
        message: `No frame data found for Machine ID: ${machineId} in ${month}.`,
      });
    }

    // Fetch the machine to check its category
    const machine = await Machine.findById(machineId);
    if (!machine || machine.category !== "Top") {
      return res.status(400).json({
        success: false,
        message:
          "Frames can only be assigned to machines in the 'Top' category.",
      });
    }

    frameRecord.frames = frames;
    await frameRecord.save();

    res.status(200).json({
      success: true,
      data: frameRecord,
      message: "Frames updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to update frames.",
      error: error.message,
    });
  }
};

exports.deleteMachineFrames = async (req, res) => {
  const { machineId, month } = req.params;

  try {
    const deletedFrames = await MachineFrame.findOneAndDelete({
      machineId,
      month,
    });

    if (!deletedFrames) {
      return res.status(404).json({
        success: false,
        message: `No frame data found for Machine ID: ${machineId} in ${month}.`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Frames deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Unable to delete frames.",
      error: error.message,
    });
  }
};

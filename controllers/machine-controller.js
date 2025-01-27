const Machine = require("../models/machine-model");

exports.createMachine = async (req, res) => {
  const { name, category, head } = req.body;

  // Validate input
  if (!name || !category || !head) {
    return res.status(400).json({ message: "Name, category and head are required." });
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
      head
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

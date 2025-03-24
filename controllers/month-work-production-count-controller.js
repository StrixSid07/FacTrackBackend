const mongoose = require("mongoose");
const moment = require("moment");

const WorkerProduction = require("../models/worker-production-model");
const MachineFrame = require("../models/machine-frame-model");
const FixValue = require("../models/fix-value-model");
const Machine = require("../models/machine-model");
const Worker = require("../models/worker-model");

exports.getMonthlySalary = async (req, res) => {
  try {
    const { month, worker, machine } = req.query;

    if (!month || !worker || !machine) {
      return res.status(400).json({
        message: "month, worker, and machine parameters are required",
      });
    }

    if (!moment(month, "YYYY-MM", true).isValid()) {
      return res
        .status(400)
        .json({ message: "Invalid month format. Expected YYYY-MM" });
    }

    // Fetch machine details
    const machineDoc = await Machine.findById(machine);
    if (!machineDoc) {
      return res.status(404).json({ message: "Machine not found" });
    }

    // Fetch worker details
    const workerDoc = await Worker.findById(worker);
    if (!workerDoc) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const category = machineDoc.category;

    if (category !== "Top" && category !== "Duppata") {
      return res.status(400).json({ message: "Unsupported machine category" });
    }

    const startDate = moment(month, "YYYY-MM").startOf("month").toDate();
    const endDate = moment(month, "YYYY-MM").endOf("month").toDate();

    let daysData = [];
    let totalFixedSalary = 0;
    let totalBonus = 0;

    // Fetch fixed salary
    const fixValueDoc = await FixValue.findOne({ month, category });
    const fixSalCount = fixValueDoc ? fixValueDoc.fixSalCount : 0;

    if (category === "Top") {
      // Fetch production data
      const productions = await WorkerProduction.aggregate([
        {
          $match: {
            worker: new mongoose.Types.ObjectId(worker),
            machine: new mongoose.Types.ObjectId(machine),
            category: "Top",
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalProduction: { $sum: "$production" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Get frame target for the machine
      const machineFrameDoc = await MachineFrame.findOne({
        machineId: machine,
        month,
      });
      const frameTarget = machineFrameDoc ? machineFrameDoc.frames : 0;

      // Calculate salary and bonuses
      let totalProduction = 0;
      let daysMetTarget = 0;

      daysData = productions.map((day) => {
        const achieved = day.totalProduction >= frameTarget;
        const bonus = achieved ? 100 : 0;

        let calculatedFixSal = fixSalCount;
        if (day.totalProduction < frameTarget) {
          calculatedFixSal = (day.totalProduction / frameTarget) * fixSalCount;
        }
        totalProduction += day.totalProduction;
        totalFixedSalary += calculatedFixSal;
        if (bonus) {
          daysMetTarget += 1;
          totalBonus += bonus;
        }

        return {
          date: day._id,
          production: parseFloat(day.totalProduction.toFixed(2)),
          targetFrames: parseFloat(frameTarget.toFixed(2)), // Add frames target for each day
          fixSalCount: parseFloat(calculatedFixSal.toFixed(2)), // FixSalCount for each day
          bonus: parseFloat(bonus.toFixed(2)),
          status: achieved ? "Achieved" : "Not Achieved",
        };
      });

      return res.json({
        category,
        machineName: machineDoc.name,
        workerName: workerDoc.name,
        fixSalCountPerDay: parseFloat(fixSalCount.toFixed(2)),
        targetFrames: parseFloat(frameTarget.toFixed(2)),
        days: daysData,
        totals: {
          totalProduction: parseFloat(totalProduction.toFixed(2)),
          totalFixedSalary: parseFloat(totalFixedSalary.toFixed(2)),
          daysMetTarget: parseFloat(daysMetTarget.toFixed(2)),
          totalBonus: parseFloat(totalBonus.toFixed(2)),
          finalSalary: parseFloat((totalFixedSalary + totalBonus).toFixed(2)),
        },
      });
    }

    if (category === "Duppata") {
      const productions = await WorkerProduction.aggregate([
        {
          $match: {
            worker: new mongoose.Types.ObjectId(worker),
            machine: new mongoose.Types.ObjectId(machine),
            category: "Duppata",
            date: { $gte: startDate, $lte: endDate },
          },
        },
        { $unwind: "$frames" },
        {
          $addFields: {
            pairPercentage: {
              $multiply: [
                { $divide: ["$frames.production", "$frames.frame"] },
                100,
              ],
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalPercentage: { $sum: "$pairPercentage" },
            frames: {
              $push: {
                production: "$frames.production",
                frame: "$frames.frame",
              },
            }, // Store production and frame values
          },
        },
        { $sort: { _id: 1 } },
      ]);

      let totalPercentage = 0;
      let daysMetTarget = 0;

      daysData = productions.map((day) => {
        const achieved = day.totalPercentage >= 100;
        const bonus = achieved ? 100 : 0;

        totalPercentage += day.totalPercentage;
        let calculatedFixSal = fixSalCount;
        if (day.totalPercentage < 100) {
          calculatedFixSal = (day.totalPercentage / 100) * fixSalCount;
        }
        totalFixedSalary += calculatedFixSal;
        if (bonus) {
          daysMetTarget += 1;
          totalBonus += bonus;
        }

        return {
          date: day._id,
          totalPercentage: parseFloat(day.totalPercentage.toFixed(2)),
          frames: day.frames.map((f) => ({
            production: parseFloat(f.production.toFixed(2)),
            frame: parseFloat(f.frame.toFixed(2)),
          })), // Print production and frames for each day
          fixSalCount: parseFloat(calculatedFixSal.toFixed(2)), // FixSalCount for each day
          bonus: parseFloat(bonus.toFixed(2)),
          status: achieved ? "Achieved" : "Not Achieved",
        };
      });

      return res.json({
        category,
        machineName: machineDoc.name,
        workerName: workerDoc.name,
        fixSalCountPerDay: parseFloat(fixSalCount.toFixed(2)),
        days: daysData,
        totals: {
          totalPercentage: parseFloat(totalPercentage.toFixed(2)),
          totalFixedSalary: parseFloat(totalFixedSalary.toFixed(2)),
          daysMetTarget: parseFloat(daysMetTarget.toFixed(2)),
          totalBonus: parseFloat(totalBonus.toFixed(2)),
          finalSalary: parseFloat((totalFixedSalary + totalBonus).toFixed(2)),
        },
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

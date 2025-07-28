const express = require("express");
const Task = require("../models/Task");
const SchedulingAlgorithms = require("../utils/schedulingAlgorithms");
const auth = require("../middleware/auth");
const router = express.Router();

// Get scheduled tasks using specific algorithm
router.get("/:algorithm", auth, async (req, res) => {
  try {
    const { algorithm } = req.params;
    const tasks = await Task.find({
      user: req.user._id,
      status: "pending",
    });

    let result;
    switch (algorithm) {
      case "sjf":
        result = SchedulingAlgorithms.shortestJobFirst(tasks);
        break;
      case "priority":
        result = SchedulingAlgorithms.priorityScheduling(tasks);
        break;
      case "roundrobin":
        result = SchedulingAlgorithms.roundRobin(tasks);
        break;
      default:
        return res.status(400).json({ message: "Invalid algorithm" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Compare all algorithms
router.get("/compare/all", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user._id,
      status: "pending",
    });

    const comparison = SchedulingAlgorithms.compareAlgorithms(tasks);
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

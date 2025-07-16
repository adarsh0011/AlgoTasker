const express = require("express");
const Task = require("../models/Task");
const protect = require("../middleware/auth");
const {
  scheduleTasksWithAlgorithm,
  compareAlgorithms,
} = require("../utils/schedulingAlgorithms");

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Schedule tasks with specific algorithm
// @route   POST /api/scheduler/schedule
// @access  Private
router.post("/schedule", async (req, res) => {
  try {
    const { algorithm, options = {} } = req.body;

    // Validate algorithm
    const validAlgorithms = ["SJF", "RoundRobin", "Priority"];
    if (!validAlgorithms.includes(algorithm)) {
      return res.status(400).json({
        success: false,
        message: "Invalid algorithm. Must be one of: SJF, RoundRobin, Priority",
      });
    }

    // Get user's tasks
    const tasks = await Task.find({
      user: req.user.id,
      status: { $in: ["pending", "in-progress"] },
    }).sort({ dueDate: 1 });

    if (tasks.length === 0) {
      return res.json({
        success: true,
        message: "No tasks to schedule",
        schedule: {
          algorithm: algorithm,
          schedule: [],
          totalTime: 0,
          metrics: {},
        },
      });
    }

    // Apply user's working hours if available
    const workingHours = req.user.preferences?.workingHours || {
      start: "09:00",
      end: "17:00",
    };
    const scheduleOptions = {
      workingHours: workingHours,
      timeQuantum: options.timeQuantum || 60,
      ...options,
    };

    // Generate schedule
    const schedule = scheduleTasksWithAlgorithm(
      tasks,
      algorithm,
      scheduleOptions
    );

    // Update tasks with scheduling information
    const updatePromises = schedule.schedule.map(async (item) => {
      return Task.findByIdAndUpdate(
        item.task._id,
        {
          $set: {
            "scheduledTime.startTime": item.startTime,
            "scheduledTime.endTime": item.endTime,
            "scheduledTime.algorithm": algorithm,
          },
        },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: "Tasks scheduled successfully",
      schedule: schedule,
    });
  } catch (error) {
    console.error("Schedule tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error scheduling tasks",
    });
  }
});

// @desc    Compare all algorithms
// @route   GET /api/scheduler/compare
// @access  Private
router.get("/compare", async (req, res) => {
  try {
    const { timeQuantum = 60 } = req.query;

    // Get user's tasks
    const tasks = await Task.find({
      user: req.user.id,
      status: { $in: ["pending", "in-progress"] },
    }).sort({ dueDate: 1 });

    if (tasks.length === 0) {
      return res.json({
        success: true,
        message: "No tasks to compare",
        comparison: {},
      });
    }

    // Apply user's working hours if available
    const workingHours = req.user.preferences?.workingHours || {
      start: "09:00",
      end: "17:00",
    };
    const options = {
      workingHours: workingHours,
      timeQuantum: parseInt(timeQuantum),
    };

    // Compare all algorithms
    const comparison = compareAlgorithms(tasks, options);

    // Add recommendation based on metrics
    const recommendation = getAlgorithmRecommendation(comparison);

    res.json({
      success: true,
      comparison: comparison,
      recommendation: recommendation,
      taskCount: tasks.length,
    });
  } catch (error) {
    console.error("Compare algorithms error:", error);
    res.status(500).json({
      success: false,
      message: "Server error comparing algorithms",
    });
  }
});

// @desc    Get current schedule
// @route   GET /api/scheduler/current
// @access  Private
router.get("/current", async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
      "scheduledTime.startTime": { $exists: true },
      status: { $in: ["pending", "in-progress"] },
    }).sort({ "scheduledTime.startTime": 1 });

    // Group tasks by date
    const scheduleByDate = {};
    tasks.forEach((task) => {
      const date = task.scheduledTime.startTime.toISOString().split("T")[0];
      if (!scheduleByDate[date]) {
        scheduleByDate[date] = [];
      }
      scheduleByDate[date].push(task);
    });

    res.json({
      success: true,
      schedule: scheduleByDate,
      totalTasks: tasks.length,
    });
  } catch (error) {
    console.error("Get current schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting current schedule",
    });
  }
});

// @desc    Clear current schedule
// @route   DELETE /api/scheduler/clear
// @access  Private
router.delete("/clear", async (req, res) => {
  try {
    await Task.updateMany(
      { user: req.user.id },
      { $unset: { scheduledTime: 1 } }
    );

    res.json({
      success: true,
      message: "Schedule cleared successfully",
    });
  } catch (error) {
    console.error("Clear schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Server error clearing schedule",
    });
  }
});

// @desc    Get scheduling analytics
// @route   GET /api/scheduler/analytics
// @access  Private
router.get("/analytics", async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Get completed tasks with scheduling data
    const completedTasks = await Task.find({
      user: req.user.id,
      status: "completed",
      completedAt: { $gte: daysAgo },
      "scheduledTime.algorithm": { $exists: true },
    });

    // Calculate analytics
    const analytics = {
      totalCompletedTasks: completedTasks.length,
      algorithmUsage: {},
      averageAccuracy: 0,
      onTimeCompletion: 0,
      timeVariance: [],
    };

    // Algorithm usage statistics
    completedTasks.forEach((task) => {
      const algorithm = task.scheduledTime.algorithm;
      if (!analytics.algorithmUsage[algorithm]) {
        analytics.algorithmUsage[algorithm] = 0;
      }
      analytics.algorithmUsage[algorithm]++;
    });

    // Calculate accuracy metrics
    let totalAccuracy = 0;
    let onTimeCount = 0;

    completedTasks.forEach((task) => {
      // Time accuracy (estimated vs actual)
      if (task.actualTimeSpent && task.estimatedTime) {
        const accuracy = Math.max(
          0,
          100 -
            Math.abs(
              ((task.actualTimeSpent - task.estimatedTime) /
                task.estimatedTime) *
                100
            )
        );
        totalAccuracy += accuracy;

        analytics.timeVariance.push({
          taskId: task._id,
          estimated: task.estimatedTime,
          actual: task.actualTimeSpent,
          variance: task.actualTimeSpent - task.estimatedTime,
        });
      }

      // On-time completion
      if (task.completedAt <= task.dueDate) {
        onTimeCount++;
      }
    });

    analytics.averageAccuracy =
      completedTasks.length > 0
        ? (totalAccuracy / completedTasks.length).toFixed(1)
        : 0;
    analytics.onTimeCompletion =
      completedTasks.length > 0
        ? ((onTimeCount / completedTasks.length) * 100).toFixed(1)
        : 0;

    res.json({
      success: true,
      analytics: analytics,
      period: `${days} days`,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting analytics",
    });
  }
});

// Helper function to recommend best algorithm
const getAlgorithmRecommendation = (comparison) => {
  const algorithms = Object.keys(comparison);
  let bestAlgorithm = null;
  let bestScore = -1;

  algorithms.forEach((algorithm) => {
    const result = comparison[algorithm];
    if (result.error) return;

    const metrics = result.metrics;
    // Calculate composite score (higher is better)
    const score =
      parseFloat(metrics.onTimeCompletion) * 0.4 +
      parseFloat(metrics.utilizationRate) * 0.3 +
      (100 - metrics.averageWaitTime) * 0.2 +
      (100 - metrics.averageTurnaroundTime) * 0.1;

    if (score > bestScore) {
      bestScore = score;
      bestAlgorithm = algorithm;
    }
  });

  return {
    algorithm: bestAlgorithm,
    score: bestScore.toFixed(1),
    reason: getBestAlgorithmReason(bestAlgorithm, comparison),
  };
};

// Helper function to explain why an algorithm is recommended
const getBestAlgorithmReason = (algorithm, comparison) => {
  if (!algorithm || !comparison[algorithm])
    return "No recommendation available";

  const metrics = comparison[algorithm].metrics;

  switch (algorithm) {
    case "SJF":
      return `Best for minimizing average wait time (${metrics.averageWaitTime} min) and completing short tasks quickly`;
    case "RoundRobin":
      return `Best for fairness and balanced task execution with ${metrics.utilizationRate}% utilization rate`;
    case "Priority":
      return `Best for deadline adherence with ${metrics.onTimeCompletion}% on-time completion rate`;
    default:
      return "Recommended based on overall performance metrics";
  }
};

module.exports = router;

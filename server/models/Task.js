const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 3,
    },
    estimatedTime: {
      type: Number, // in minutes
      required: [true, "Estimated time is required"],
      min: [1, "Estimated time must be at least 1 minute"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    category: {
      type: String,
      enum: ["work", "personal", "urgent", "meeting", "other"],
      default: "other",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    scheduledTime: {
      startTime: Date,
      endTime: Date,
      algorithm: {
        type: String,
        enum: ["SJF", "RoundRobin", "Priority"],
      },
    },
    completedAt: Date,
    actualTimeSpent: Number, // in minutes
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
      },
      interval: Number,
      endDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, priority: -1 });
taskSchema.index({ user: 1, status: 1 });

// Virtual for urgency calculation
taskSchema.virtual("urgency").get(function () {
  const now = new Date();
  const timeLeft = this.dueDate - now;
  const hoursLeft = timeLeft / (1000 * 60 * 60);

  if (hoursLeft < 0) return 10; // Overdue
  if (hoursLeft < 24) return 9; // Due today
  if (hoursLeft < 48) return 8; // Due tomorrow
  if (hoursLeft < 168) return 7; // Due this week

  return Math.max(1, 6 - Math.floor(hoursLeft / 168));
});

// Method to check if task is overdue
taskSchema.methods.isOverdue = function () {
  return new Date() > this.dueDate && this.status !== "completed";
};

// Method to calculate scheduling weight for algorithms
taskSchema.methods.getSchedulingWeight = function () {
  const urgency = this.urgency;
  const priority = this.priority;
  const estimatedTime = this.estimatedTime;

  return {
    priority: priority,
    urgency: urgency,
    estimatedTime: estimatedTime,
    combinedWeight: priority * 0.4 + urgency * 0.4 + (60 - estimatedTime) * 0.2,
  };
};

module.exports = mongoose.model("Task", taskSchema);

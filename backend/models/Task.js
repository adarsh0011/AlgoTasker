const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 3,
    },
    estimatedTime: {
      type: Number,
      required: true,
      min: 1,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    urgency: {
      type: Number,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate urgency based on due date and priority
TaskSchema.pre("save", function (next) {
  const now = new Date();
  const timeDiff = this.dueDate - now;
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

  // Urgency calculation: closer due date + higher priority = higher urgency
  let urgencyScore = this.priority * 2;
  if (daysDiff <= 1) urgencyScore += 4;
  else if (daysDiff <= 3) urgencyScore += 2;
  else if (daysDiff <= 7) urgencyScore += 1;

  this.urgency = Math.min(Math.max(urgencyScore, 1), 10);
  next();
});

module.exports = mongoose.model("Task", TaskSchema);

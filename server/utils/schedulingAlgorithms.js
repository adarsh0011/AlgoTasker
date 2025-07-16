/**
 * Scheduling Algorithms for AlgoTasker
 * Implements SJF (Shortest Job First), Round Robin, and Priority Scheduling
 */

// Shortest Job First Algorithm
const shortestJobFirst = (
  tasks,
  workingHours = { start: "09:00", end: "17:00" }
) => {
  // Sort tasks by estimated time (shortest first)
  const sortedTasks = [...tasks].sort(
    (a, b) => a.estimatedTime - b.estimatedTime
  );

  const schedule = [];
  let currentTime = getNextWorkingTime(new Date(), workingHours);

  for (const task of sortedTasks) {
    const startTime = new Date(currentTime);
    const endTime = new Date(
      currentTime.getTime() + task.estimatedTime * 60000
    );

    // Check if task fits within working hours
    const adjustedTimes = adjustForWorkingHours(
      startTime,
      endTime,
      workingHours
    );

    schedule.push({
      task: task,
      startTime: adjustedTimes.start,
      endTime: adjustedTimes.end,
      algorithm: "SJF",
    });

    currentTime = adjustedTimes.end;
  }

  return {
    algorithm: "SJF",
    schedule: schedule,
    totalTime: calculateTotalTime(schedule),
    metrics: calculateMetrics(schedule, tasks),
  };
};

// Round Robin Algorithm
const roundRobin = (
  tasks,
  timeQuantum = 60,
  workingHours = { start: "09:00", end: "17:00" }
) => {
  const schedule = [];
  const taskQueue = [...tasks].map((task) => ({
    ...task,
    remainingTime: task.estimatedTime,
  }));

  let currentTime = getNextWorkingTime(new Date(), workingHours);

  while (taskQueue.length > 0) {
    const currentTask = taskQueue.shift();
    const executionTime = Math.min(currentTask.remainingTime, timeQuantum);

    const startTime = new Date(currentTime);
    const endTime = new Date(currentTime.getTime() + executionTime * 60000);

    const adjustedTimes = adjustForWorkingHours(
      startTime,
      endTime,
      workingHours
    );

    schedule.push({
      task: currentTask,
      startTime: adjustedTimes.start,
      endTime: adjustedTimes.end,
      algorithm: "RoundRobin",
      quantum: executionTime,
      isComplete: currentTask.remainingTime <= timeQuantum,
    });

    currentTime = adjustedTimes.end;
    currentTask.remainingTime -= executionTime;

    // If task is not complete, add it back to queue
    if (currentTask.remainingTime > 0) {
      taskQueue.push(currentTask);
    }
  }

  return {
    algorithm: "RoundRobin",
    schedule: schedule,
    totalTime: calculateTotalTime(schedule),
    metrics: calculateMetrics(schedule, tasks),
  };
};

// Priority Scheduling Algorithm
const priorityScheduling = (
  tasks,
  workingHours = { start: "09:00", end: "17:00" }
) => {
  // Sort tasks by priority (higher priority first) and urgency
  const sortedTasks = [...tasks].sort((a, b) => {
    const aWeight = a.getSchedulingWeight();
    const bWeight = b.getSchedulingWeight();

    // Primary sort by combined weight (higher is better)
    if (aWeight.combinedWeight !== bWeight.combinedWeight) {
      return bWeight.combinedWeight - aWeight.combinedWeight;
    }

    // Secondary sort by due date (earlier first)
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const schedule = [];
  let currentTime = getNextWorkingTime(new Date(), workingHours);

  for (const task of sortedTasks) {
    const startTime = new Date(currentTime);
    const endTime = new Date(
      currentTime.getTime() + task.estimatedTime * 60000
    );

    const adjustedTimes = adjustForWorkingHours(
      startTime,
      endTime,
      workingHours
    );

    schedule.push({
      task: task,
      startTime: adjustedTimes.start,
      endTime: adjustedTimes.end,
      algorithm: "Priority",
      priority: task.priority,
      urgency: task.urgency,
      weight: task.getSchedulingWeight(),
    });

    currentTime = adjustedTimes.end;
  }

  return {
    algorithm: "Priority",
    schedule: schedule,
    totalTime: calculateTotalTime(schedule),
    metrics: calculateMetrics(schedule, tasks),
  };
};

// Helper function to get next working time
const getNextWorkingTime = (date, workingHours) => {
  const workStart = parseTime(workingHours.start);
  const workEnd = parseTime(workingHours.end);
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();

  // If current time is before work start, set to work start
  if (
    currentHour < workStart.hour ||
    (currentHour === workStart.hour && currentMinute < workStart.minute)
  ) {
    const nextWorkTime = new Date(date);
    nextWorkTime.setHours(workStart.hour, workStart.minute, 0, 0);
    return nextWorkTime;
  }

  // If current time is after work end, set to next day work start
  if (
    currentHour > workEnd.hour ||
    (currentHour === workEnd.hour && currentMinute >= workEnd.minute)
  ) {
    const nextWorkTime = new Date(date);
    nextWorkTime.setDate(nextWorkTime.getDate() + 1);
    nextWorkTime.setHours(workStart.hour, workStart.minute, 0, 0);
    return nextWorkTime;
  }

  // If within working hours, return current time
  return new Date(date);
};

// Helper function to adjust task times for working hours
const adjustForWorkingHours = (startTime, endTime, workingHours) => {
  const workStart = parseTime(workingHours.start);
  const workEnd = parseTime(workingHours.end);

  let adjustedStart = new Date(startTime);
  let adjustedEnd = new Date(endTime);

  // Ensure start time is within working hours
  adjustedStart = getNextWorkingTime(adjustedStart, workingHours);

  // Calculate task duration
  const duration = endTime - startTime;

  // Check if task spans across non-working hours
  const startHour = adjustedStart.getHours();
  const startMinute = adjustedStart.getMinutes();
  const endHour = adjustedEnd.getHours();
  const endMinute = adjustedEnd.getMinutes();

  // If task ends after working hours, split across days
  if (
    endHour > workEnd.hour ||
    (endHour === workEnd.hour && endMinute > workEnd.minute)
  ) {
    // Calculate remaining work time today
    const endOfDay = new Date(adjustedStart);
    endOfDay.setHours(workEnd.hour, workEnd.minute, 0, 0);

    const timeToday = endOfDay - adjustedStart;
    const remainingTime = duration - timeToday;

    if (remainingTime > 0) {
      // Continue next working day
      const nextDay = new Date(adjustedStart);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(workStart.hour, workStart.minute, 0, 0);

      adjustedEnd = new Date(nextDay.getTime() + remainingTime);
    } else {
      adjustedEnd = endOfDay;
    }
  } else {
    adjustedEnd = new Date(adjustedStart.getTime() + duration);
  }

  return {
    start: adjustedStart,
    end: adjustedEnd,
  };
};

// Helper function to parse time string (HH:MM)
const parseTime = (timeString) => {
  const [hour, minute] = timeString.split(":").map(Number);
  return { hour, minute };
};

// Helper function to calculate total time
const calculateTotalTime = (schedule) => {
  if (schedule.length === 0) return 0;

  const start = schedule[0].startTime;
  const end = schedule[schedule.length - 1].endTime;

  return Math.ceil((end - start) / (1000 * 60)); // in minutes
};

// Helper function to calculate scheduling metrics
const calculateMetrics = (schedule, originalTasks) => {
  const metrics = {
    totalTasks: originalTasks.length,
    scheduledTasks: schedule.length,
    averageWaitTime: 0,
    averageTurnaroundTime: 0,
    onTimeCompletion: 0,
    utilizationRate: 0,
  };

  if (schedule.length === 0) return metrics;

  let totalWaitTime = 0;
  let totalTurnaroundTime = 0;
  let onTimeCount = 0;

  const scheduleStart = schedule[0].startTime;

  schedule.forEach((item, index) => {
    const task = item.task;
    const waitTime = item.startTime - scheduleStart;
    const turnaroundTime = item.endTime - scheduleStart;

    totalWaitTime += waitTime;
    totalTurnaroundTime += turnaroundTime;

    // Check if completed before due date
    if (item.endTime <= new Date(task.dueDate)) {
      onTimeCount++;
    }
  });

  metrics.averageWaitTime = Math.ceil(
    totalWaitTime / schedule.length / (1000 * 60)
  ); // in minutes
  metrics.averageTurnaroundTime = Math.ceil(
    totalTurnaroundTime / schedule.length / (1000 * 60)
  ); // in minutes
  metrics.onTimeCompletion = ((onTimeCount / schedule.length) * 100).toFixed(1);

  // Calculate utilization rate
  const totalScheduledTime = schedule.reduce((sum, item) => {
    return sum + (item.endTime - item.startTime);
  }, 0);

  const totalSpan =
    schedule[schedule.length - 1].endTime - schedule[0].startTime;
  metrics.utilizationRate = ((totalScheduledTime / totalSpan) * 100).toFixed(1);

  return metrics;
};

// Main scheduling function that chooses algorithm
const scheduleTasksWithAlgorithm = (tasks, algorithm, options = {}) => {
  const workingHours = options.workingHours || { start: "09:00", end: "17:00" };
  const timeQuantum = options.timeQuantum || 60;

  // Filter only pending and in-progress tasks
  const availableTasks = tasks.filter(
    (task) => task.status === "pending" || task.status === "in-progress"
  );

  if (availableTasks.length === 0) {
    return {
      algorithm: algorithm,
      schedule: [],
      totalTime: 0,
      metrics: calculateMetrics([], []),
    };
  }

  switch (algorithm) {
    case "SJF":
      return shortestJobFirst(availableTasks, workingHours);
    case "RoundRobin":
      return roundRobin(availableTasks, timeQuantum, workingHours);
    case "Priority":
      return priorityScheduling(availableTasks, workingHours);
    default:
      throw new Error(`Unknown algorithm: ${algorithm}`);
  }
};

// Compare all algorithms
const compareAlgorithms = (tasks, options = {}) => {
  const algorithms = ["SJF", "RoundRobin", "Priority"];
  const results = {};

  algorithms.forEach((algorithm) => {
    try {
      results[algorithm] = scheduleTasksWithAlgorithm(
        tasks,
        algorithm,
        options
      );
    } catch (error) {
      results[algorithm] = {
        error: error.message,
        algorithm: algorithm,
      };
    }
  });

  return results;
};

module.exports = {
  shortestJobFirst,
  roundRobin,
  priorityScheduling,
  scheduleTasksWithAlgorithm,
  compareAlgorithms,
};

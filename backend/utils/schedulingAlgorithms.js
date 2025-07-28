class SchedulingAlgorithms {
  // Shortest Job First (SJF)
  static shortestJobFirst(tasks) {
    const sortedTasks = [...tasks].sort(
      (a, b) => a.estimatedTime - b.estimatedTime
    );

    let currentTime = 0;
    const schedule = sortedTasks.map((task) => {
      const startTime = currentTime;
      const endTime = currentTime + task.estimatedTime;
      currentTime = endTime;

      return {
        task: task,
        startTime,
        endTime,
        waitTime: startTime,
        turnaroundTime: endTime,
      };
    });

    return {
      schedule,
      avgWaitTime:
        schedule.reduce((sum, item) => sum + item.waitTime, 0) /
        schedule.length,
      avgTurnaroundTime:
        schedule.reduce((sum, item) => sum + item.turnaroundTime, 0) /
        schedule.length,
    };
  }

  // Priority Scheduling
  static priorityScheduling(tasks) {
    const sortedTasks = [...tasks].sort(
      (a, b) => b.urgency - a.urgency || a.estimatedTime - b.estimatedTime
    );

    let currentTime = 0;
    const schedule = sortedTasks.map((task) => {
      const startTime = currentTime;
      const endTime = currentTime + task.estimatedTime;
      currentTime = endTime;

      return {
        task: task,
        startTime,
        endTime,
        waitTime: startTime,
        turnaroundTime: endTime,
        priority: task.urgency,
      };
    });

    return {
      schedule,
      avgWaitTime:
        schedule.reduce((sum, item) => sum + item.waitTime, 0) /
        schedule.length,
      avgTurnaroundTime:
        schedule.reduce((sum, item) => sum + item.turnaroundTime, 0) /
        schedule.length,
    };
  }

  // Round Robin
  static roundRobin(tasks, timeQuantum = 2) {
    const queue = [...tasks];
    const schedule = [];
    let currentTime = 0;
    let completedTasks = new Set();

    while (queue.length > 0) {
      const task = queue.shift();

      if (completedTasks.has(task._id)) continue;

      const executionTime = Math.min(timeQuantum, task.estimatedTime);
      const startTime = currentTime;
      const endTime = currentTime + executionTime;

      schedule.push({
        task: task,
        startTime,
        endTime,
        executionTime,
        remainingTime: task.estimatedTime - executionTime,
      });

      currentTime = endTime;

      if (task.estimatedTime <= timeQuantum) {
        completedTasks.add(task._id);
      } else {
        // Add back to queue with reduced time
        const updatedTask = {
          ...task,
          estimatedTime: task.estimatedTime - timeQuantum,
        };
        queue.push(updatedTask);
      }
    }

    return { schedule };
  }

  // Compare all algorithms
  static compareAlgorithms(tasks) {
    return {
      sjf: this.shortestJobFirst(tasks),
      priority: this.priorityScheduling(tasks),
      roundRobin: this.roundRobin(tasks),
    };
  }
}

module.exports = SchedulingAlgorithms;

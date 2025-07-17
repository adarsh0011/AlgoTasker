import api from "./api";

const schedulerService = {
  scheduleTasksSJF: () => {
    return api.get("/scheduler/sjf");
  },

  scheduleTasksRR: (timeQuantum = 2) => {
    return api.get(`/scheduler/round-robin?timeQuantum=${timeQuantum}`);
  },

  scheduleTasksPriority: () => {
    return api.get("/scheduler/priority");
  },

  compareAlgorithms: () => {
    return api.get("/scheduler/compare");
  },

  getAnalytics: () => {
    return api.get("/scheduler/analytics");
  },
};

export default schedulerService;

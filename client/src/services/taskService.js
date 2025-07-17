import api from "./api";

const taskService = {
  getTasks: () => {
    return api.get("/tasks");
  },

  createTask: (taskData) => {
    return api.post("/tasks", taskData);
  },

  updateTask: (id, taskData) => {
    return api.put(`/tasks/${id}`, taskData);
  },

  deleteTask: (id) => {
    return api.delete(`/tasks/${id}`);
  },

  getTaskById: (id) => {
    return api.get(`/tasks/${id}`);
  },
};

export default taskService;

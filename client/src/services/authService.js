import api from "./api";

const authService = {
  login: (email, password) => {
    return api.post("/auth/login", { email, password });
  },

  register: (name, email, password) => {
    return api.post("/auth/register", { name, email, password });
  },

  logout: () => {
    localStorage.removeItem("token");
    return Promise.resolve();
  },

  getCurrentUser: () => {
    return api.get("/auth/me");
  },
};

export default authService;

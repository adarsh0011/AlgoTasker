import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Button,
} from "@mui/material";
import { Task, Schedule, TrendingUp, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/api/tasks");
      const tasks = response.data;

      const now = new Date();
      const overdue = tasks.filter(
        (task) => new Date(task.dueDate) < now && task.status !== "completed"
      );

      setStats({
        totalTasks: tasks.length,
        completedTasks: tasks.filter((task) => task.status === "completed")
          .length,
        pendingTasks: tasks.filter((task) => task.status === "pending").length,
        overdueTasks: overdue.length,
      });

      setRecentTasks(tasks.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority >= 4) return "error";
    if (priority >= 3) return "warning";
    return "success";
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Task sx={{ color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Tasks
                  </Typography>
                  <Typography variant="h4">{stats.totalTasks}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Schedule sx={{ color: "success.main", mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h4">{stats.completedTasks}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TrendingUp sx={{ color: "warning.main", mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4">{stats.pendingTasks}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Task sx={{ color: "error.main", mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Overdue
                  </Typography>
                  <Typography variant="h4">{stats.overdueTasks}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Tasks */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Recent Tasks</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/tasks")}
            >
              Add Task
            </Button>
          </Box>

          {recentTasks.length === 0 ? (
            <Typography color="textSecondary">
              No tasks yet. Create your first task!
            </Typography>
          ) : (
            recentTasks.map((task) => (
              <Box
                key={task._id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <Box>
                  <Typography variant="subtitle1">{task.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Chip
                    label={`Priority ${task.priority}`}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                  <Chip label={task.status} variant="outlined" size="small" />
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;

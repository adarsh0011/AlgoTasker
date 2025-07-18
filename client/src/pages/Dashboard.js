import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
} from "@mui/material";
import {
  Assignment as TaskIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CompletedIcon,
} from "@mui/icons-material";
import { fetchTasks } from "../store/slices/taskSlice";
import Layout from "../components/common/Layout";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { tasks } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const upcomingTasks = tasks
    .filter((task) => task.status !== "completed")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const statCards = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: <TaskIcon sx={{ fontSize: 40 }} />,
      color: "#1976d2",
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: <CompletedIcon sx={{ fontSize: 40 }} />,
      color: "#4caf50",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: "#ff9800",
    },
    {
      title: "Completion Rate",
      value: `${completionRate.toFixed(1)}%`,
      icon: <TrendingIcon sx={{ fontSize: 40 }} />,
      color: "#9c27b0",
    },
  ];

  return (
    <Layout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        {card.title}
                      </Typography>
                      <Typography variant="h4" component="h2">
                        {card.value}
                      </Typography>
                    </Box>
                    <Box sx={{ color: card.color }}>{card.icon}</Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Task Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Overall Completion</Typography>
                  <Typography variant="body2">
                    {completionRate.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completionRate}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Box sx={{ mb: 1 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Pending Tasks</Typography>
                  <Typography variant="body2">{pendingTasks}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Tasks
              </Typography>
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <Box
                    key={task._id}
                    sx={{
                      mb: 2,
                      p: 2,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2">{task.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="textSecondary">No upcoming tasks</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard;

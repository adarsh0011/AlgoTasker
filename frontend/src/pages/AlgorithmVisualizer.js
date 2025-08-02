import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { PlayArrow, Compare, Refresh } from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import api from "../utils/api";
import GanttChart from "../components/GanttChart";

const AlgorithmVisualizer = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("sjf");
  const [scheduleResult, setScheduleResult] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get("/api/tasks");
      const pendingTasks = response.data.filter(
        (task) => task.status === "pending"
      );
      setTasks(pendingTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const runAlgorithm = async () => {
    if (tasks.length === 0) {
      alert("No pending tasks available for scheduling");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/api/schedule/${selectedAlgorithm}`);
      setScheduleResult(response.data);
    } catch (error) {
      console.error("Error running algorithm:", error);
    } finally {
      setLoading(false);
    }
  };

  const compareAlgorithms = async () => {
    if (tasks.length === 0) {
      alert("No pending tasks available for comparison");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/api/schedule/compare/all");
      setComparisonData(response.data);
    } catch (error) {
      console.error("Error comparing algorithms:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAlgorithmName = (key) => {
    switch (key) {
      case "sjf":
        return "Shortest Job First";
      case "priority":
        return "Priority Scheduling";
      case "roundRobin":
        return "Round Robin";
      default:
        return key;
    }
  };

  const formatScheduleForChart = (schedule) => {
    return schedule.map((item, index) => ({
      id: index,
      taskName: item.task.title,
      startTime: item.startTime,
      endTime: item.endTime,
      duration: item.endTime - item.startTime,
      priority: item.task.priority,
      urgency: item.task.urgency,
    }));
  };

  const formatComparisonData = () => {
    if (!comparisonData) return [];

    return Object.keys(comparisonData).map((algorithm) => ({
      algorithm: getAlgorithmName(algorithm),
      avgWaitTime: comparisonData[algorithm].avgWaitTime || 0,
      avgTurnaroundTime: comparisonData[algorithm].avgTurnaroundTime || 0,
      totalTasks: comparisonData[algorithm].schedule?.length || 0,
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Algorithm Visualizer
      </Typography>

      {tasks.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No pending tasks available. Please add some tasks first.
        </Alert>
      )}

      {/* Controls */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Algorithm</InputLabel>
            <Select
              value={selectedAlgorithm}
              label="Algorithm"
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            >
              <MenuItem value="sjf">Shortest Job First (SJF)</MenuItem>
              <MenuItem value="priority">Priority Scheduling</MenuItem>
              <MenuItem value="roundrobin">Round Robin</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={runAlgorithm}
              disabled={loading || tasks.length === 0}
            >
              Run Algorithm
            </Button>
            <Button
              variant="outlined"
              startIcon={<Compare />}
              onClick={compareAlgorithms}
              disabled={loading || tasks.length === 0}
            >
              Compare All
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchTasks}
            >
              Refresh Tasks
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Single Algorithm Result */}
      {scheduleResult && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {getAlgorithmName(selectedAlgorithm)} Results
                </Typography>

                {/* Gantt Chart */}
                <Box sx={{ height: 300, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Schedule Timeline
                  </Typography>
                  <GanttChart
                    data={formatScheduleForChart(scheduleResult.schedule)}
                  />
                </Box>

                {/* Statistics */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      Average Wait Time:{" "}
                      {scheduleResult.avgWaitTime?.toFixed(2) || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      Average Turnaround Time:{" "}
                      {scheduleResult.avgTurnaroundTime?.toFixed(2) || "N/A"}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Algorithm Comparison */}
      {comparisonData && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Algorithm Comparison
                </Typography>

                {/* Comparison Chart */}
                <Box sx={{ height: 400, mb: 3 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatComparisonData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="algorithm" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="avgWaitTime"
                        fill="#8884d8"
                        name="Avg Wait Time"
                      />
                      <Bar
                        dataKey="avgTurnaroundTime"
                        fill="#82ca9d"
                        name="Avg Turnaround Time"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                {/* Detailed Comparison Table */}
                <Box sx={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Algorithm
                        </th>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Avg Wait Time
                        </th>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Avg Turnaround Time
                        </th>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Total Tasks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formatComparisonData().map((row, index) => (
                        <tr key={index}>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {row.algorithm}
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {row.avgWaitTime.toFixed(2)}
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {row.avgTurnaroundTime.toFixed(2)}
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {row.totalTasks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AlgorithmVisualizer;

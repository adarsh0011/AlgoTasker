import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Compare as CompareIcon,
} from "@mui/icons-material";
import Layout from "../components/common/Layout";
import ScheduleVisualization from "../components/scheduler/ScheduleVisualization";
import {
  scheduleTasksSJF,
  scheduleTasksRR,
  scheduleTasksPriority,
  compareAlgorithms,
} from "../store/slices/schedulerSlice";

const SchedulerPage = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("SJF");
  const [timeQuantum, setTimeQuantum] = useState(2);

  const dispatch = useDispatch();
  const { scheduledTasks, algorithmComparison, isLoading } = useSelector(
    (state) => state.scheduler
  );
  const { tasks } = useSelector((state) => state.tasks);

  const algorithms = [
    {
      value: "SJF",
      label: "Shortest Job First",
      description: "Schedules tasks based on estimated completion time",
    },
    {
      value: "RR",
      label: "Round Robin",
      description: "Cycles through tasks with fixed time slots",
    },
    {
      value: "Priority",
      label: "Priority Queue",
      description: "Schedules tasks based on priority and due date",
    },
  ];

  const handleSchedule = async () => {
    switch (selectedAlgorithm) {
      case "SJF":
        await dispatch(scheduleTasksSJF());
        break;
      case "RR":
        await dispatch(scheduleTasksRR(timeQuantum));
        break;
      case "Priority":
        await dispatch(scheduleTasksPriority());
        break;
      default:
        break;
    }
  };

  const handleCompare = async () => {
    await dispatch(compareAlgorithms());
  };

  const getAlgorithmInfo = (algorithm) => {
    return algorithms.find((alg) => alg.value === algorithm);
  };

  return (
    <Layout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Task Scheduler
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Algorithm Selection
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Algorithm</InputLabel>
                  <Select
                    value={selectedAlgorithm}
                    onChange={(e) => setSelectedAlgorithm(e.target.value)}
                    label="Algorithm"
                  >
                    {algorithms.map((alg) => (
                      <MenuItem key={alg.value} value={alg.value}>
                        {alg.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedAlgorithm === "RR" && (
                  <TextField
                    fullWidth
                    label="Time Quantum (hours)"
                    type="number"
                    value={timeQuantum}
                    onChange={(e) => setTimeQuantum(Number(e.target.value))}
                    sx={{ mb: 2 }}
                    inputProps={{ min: 1, max: 8 }}
                  />
                )}

                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 2 }}
                >
                  {getAlgorithmInfo(selectedAlgorithm)?.description}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
                  <Button
                    variant="contained"
                    startIcon={<PlayIcon />}
                    onClick={handleSchedule}
                    disabled={isLoading || tasks.length === 0}
                    fullWidth
                  >
                    {isLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Schedule Tasks"
                    )}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<CompareIcon />}
                    onClick={handleCompare}
                    disabled={isLoading || tasks.length === 0}
                    fullWidth
                  >
                    Compare Algorithms
                  </Button>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Available Tasks:{" "}
                    {tasks.filter((t) => t.status !== "completed").length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            {scheduledTasks.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Scheduled Tasks ({selectedAlgorithm})
                  </Typography>
                  <ScheduleVisualization
                    tasks={scheduledTasks}
                    algorithm={selectedAlgorithm}
                  />
                </CardContent>
              </Card>
            )}

            {algorithmComparison && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Algorithm Comparison
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(algorithmComparison).map(
                      ([algorithm, data]) => (
                        <Grid item xs={12} sm={4} key={algorithm}>
                          <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="subtitle1" gutterBottom>
                              {algorithm}
                            </Typography>
                            <Typography variant="h6" color="primary">
                              {data.averageWaitTime?.toFixed(2) || "N/A"}h
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Avg. Wait Time
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Efficiency: {data.efficiency?.toFixed(1) || "N/A"}
                              %
                            </Typography>
                          </Paper>
                        </Grid>
                      )
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {scheduledTasks.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Schedule Details
              </Typography>
              <Grid container spacing={2}>
                {scheduledTasks.map((task, index) => (
                  <Grid item xs={12} sm={6} md={4} key={task._id}>
                    <Paper sx={{ p: 2 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography variant="subtitle2">
                          {task.title}
                        </Typography>
                        <Chip label={`#${index + 1}`} size="small" />
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        Est. Time: {task.estimatedTime}h
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Priority: {task.priority}
                      </Typography>
                      {task.startTime && (
                        <Typography variant="body2" color="textSecondary">
                          Start: {new Date(task.startTime).toLocaleString()}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
    </Layout>
  );
};

export default SchedulerPage;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { fetchTasks, deleteTask } from "../../store/slices/taskSlice";
import TaskForm from "./TaskForm";
import { format } from "date-fns";

const TaskList = () => {
  const [openForm, setOpenForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const dispatch = useDispatch();
  const { tasks, isLoading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setOpenForm(true);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      await dispatch(deleteTask(taskToDelete._id));
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedTask(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "info";
      case "pending":
        return "default";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          My Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Add Task
        </Button>
      </Box>

      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid item xs={12} md={6} lg={4} key={task._id}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={2}
                >
                  <Typography variant="h6" component="h2">
                    {task.title}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditTask(task)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(task)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {task.description}
                </Typography>

                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                  <Chip
                    label={task.status}
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                </Box>

                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <ScheduleIcon fontSize="small" />
                  <Typography variant="body2">
                    {task.estimatedTime} hours
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Due: {format(new Date(task.dueDate), "MMM dd, yyyy HH:mm")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {tasks.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No tasks yet. Create your first task!
          </Typography>
        </Box>
      )}

      <TaskForm open={openForm} onClose={handleCloseForm} task={selectedTask} />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{taskToDelete?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList;

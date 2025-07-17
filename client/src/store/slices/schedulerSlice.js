import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import schedulerService from "../../services/schedulerService";

export const scheduleTasksSJF = createAsyncThunk(
  "scheduler/scheduleTasksSJF",
  async (_, { rejectWithValue }) => {
    try {
      const response = await schedulerService.scheduleTasksSJF();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const scheduleTasksRR = createAsyncThunk(
  "scheduler/scheduleTasksRR",
  async (timeQuantum, { rejectWithValue }) => {
    try {
      const response = await schedulerService.scheduleTasksRR(timeQuantum);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const scheduleTasksPriority = createAsyncThunk(
  "scheduler/scheduleTasksPriority",
  async (_, { rejectWithValue }) => {
    try {
      const response = await schedulerService.scheduleTasksPriority();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const compareAlgorithms = createAsyncThunk(
  "scheduler/compareAlgorithms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await schedulerService.compareAlgorithms();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const schedulerSlice = createSlice({
  name: "scheduler",
  initialState: {
    scheduledTasks: [],
    algorithmComparison: null,
    currentAlgorithm: "SJF",
    isLoading: false,
    error: null,
  },
  reducers: {
    setCurrentAlgorithm: (state, action) => {
      state.currentAlgorithm = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(scheduleTasksSJF.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(scheduleTasksSJF.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scheduledTasks = action.payload.scheduledTasks;
        state.currentAlgorithm = "SJF";
      })
      .addCase(scheduleTasksSJF.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(scheduleTasksRR.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scheduledTasks = action.payload.scheduledTasks;
        state.currentAlgorithm = "RR";
      })
      .addCase(scheduleTasksPriority.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scheduledTasks = action.payload.scheduledTasks;
        state.currentAlgorithm = "Priority";
      })
      .addCase(compareAlgorithms.fulfilled, (state, action) => {
        state.algorithmComparison = action.payload;
      });
  },
});

export const { setCurrentAlgorithm, clearError } = schedulerSlice.actions;
export default schedulerSlice.reducer;

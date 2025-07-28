import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { M_AvailableQueue, M_ClinicQueue } from "../types"
import { apiService } from "../services/api"

interface QueueState {
  availableQueues: M_AvailableQueue[]
  todayQueues: M_ClinicQueue[]
  clientAppointments: M_ClinicQueue[] 
  loading: boolean
  error: string | null
}

const initialState: QueueState = {
  availableQueues: [],
  todayQueues: [],
  clientAppointments: [], 
  loading: false,
  error: null,
}

export const fetchAvailableQueuesForToday = createAsyncThunk<M_AvailableQueue[]>(
  "queue/fetchAvailableQueuesForToday",
  async () => {
    return await apiService.getAvailableQueuesForToday()
  }
)

export const fetchAvailableQueuesForSpecialization = createAsyncThunk<M_AvailableQueue[], string>(
  "queue/fetchAvailableQueuesForSpecialization",
  async (specialization: string) => {
    return await apiService.getAvailableQueuesForSpecialization(specialization)
  }
)

export const makeAppointment = createAsyncThunk<
  any,
  { idDoctor: string; idClient: string; date: string; hour: number }
>("queue/makeAppointment", async ({ idDoctor, idClient, date, hour }) => {
  return await apiService.makeAppointment(idDoctor, idClient, date, hour)
})

export const addQueues = createAsyncThunk<string>(
  "queue/addQueues",
  async () => {
    return await apiService.addQueues()
  }
)

export const fetchAvailableQueuesForDate = createAsyncThunk<
  M_AvailableQueue[],
  {
    date: string;
    firstName?: string;
    lastName?: string;
  }
>(
  "queue/fetchAvailableQueuesForDate",
  async ({ date, firstName, lastName }) => {
    return await apiService.getAvailableQueuesForDayAndSpec(
      date,
      firstName,
      lastName
    );
  }
)

export const fetchClientAppointments = createAsyncThunk<M_ClinicQueue[], string>(
  "queue/fetchClientAppointments",
  async (clientId) => {
    return await apiService.getClientQueues(clientId);
  }
);

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableQueuesForToday.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAvailableQueuesForToday.fulfilled, (state, action) => {
        state.loading = false
        state.availableQueues = action.payload
      })
      .addCase(fetchAvailableQueuesForToday.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch available queues"
      })

      .addCase(fetchAvailableQueuesForSpecialization.pending, (state) => {
        state.loading = true
        state.error = null
        state.availableQueues = []
      })
      .addCase(fetchAvailableQueuesForSpecialization.fulfilled, (state, action) => {
        state.loading = false
        state.availableQueues = action.payload
      })
      .addCase(fetchAvailableQueuesForSpecialization.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch available queues by specialization"
      })

      .addCase(makeAppointment.fulfilled, (state) => {
        state.loading = false
      })

      .addCase(fetchAvailableQueuesForDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableQueuesForDate.fulfilled, (state, action) => {
        state.loading = false;
        state.availableQueues = action.payload;
      })
      .addCase(fetchAvailableQueuesForDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch queues by date";
      })

      .addCase(addQueues.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addQueues.fulfilled, (state, action) => {
        state.loading = false
        console.log("Queues added:", action.payload)
      })
      .addCase(addQueues.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to add queues"
      })

      .addCase(fetchClientAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.clientAppointments = action.payload;
      })
      .addCase(fetchClientAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch client appointments";
      });
  },
})

export const { clearError } = queueSlice.actions
export default queueSlice.reducer

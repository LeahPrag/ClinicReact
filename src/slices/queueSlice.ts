import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { M_AvailableQueue, M_ClinicQueue } from "../types"
import { apiService } from "../services/api"

interface QueueState {
  availableQueues: M_AvailableQueue[]
  todayQueues: M_ClinicQueue[]
  loading: boolean
  error: string | null
}

const initialState: QueueState = {
  availableQueues: [],
  todayQueues: [],
  loading: false,
  error: null,
}

// Async thunks עם טיפוסים מתאימים
export const fetchAvailableQueuesForToday = createAsyncThunk<M_AvailableQueue[]>(
  "queue/fetchAvailableQueuesForToday",
  async () => {
    return await apiService.getAvailableQueuesForToday()
  }
)

export const makeAppointment = createAsyncThunk<any, { idDoctor: string; idClient: string; date: string; hour: number }>(
  "queue/makeAppointment",
  async ({ idDoctor, idClient, date, hour }) => {
    return await apiService.makeAppointment(idDoctor, idClient, date, hour)
  },
)

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
      // Fetch available queues for today
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
      // Make appointment
      .addCase(makeAppointment.fulfilled, (state) => {
        state.loading = false
      })
  },
})

export const { clearError } = queueSlice.actions
export default queueSlice.reducer


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

// thunk חדש לפי התמחות
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

// export const fetchAvailableQueuesForDate = createAsyncThunk<
//   M_AvailableQueue[],
//   { date: string; specialization?: string | null }
// >(
//   "queue/fetchAvailableQueuesForDate",
//   async ({ date, specialization }) => {
//     return await apiService.getAvailableQueuesForDayAndSpec(date, specialization)
//   }
// )
// In your queueSlice.ts
// In queueSlice.ts
export const fetchAvailableQueuesForDate = createAsyncThunk<
  M_AvailableQueue[],
  { 
    date: string;
    doctorName?: string;
    specialization?: string | null;
  }
>(
  "queue/fetchAvailableQueuesForDate",
  async ({ date, doctorName, specialization }) => {
    return await apiService.getAvailableQueuesForDayAndSpec(
      date,
      doctorName,
      specialization
    );
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

      // Fetch available queues by specialization
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

      // Make appointment
      .addCase(makeAppointment.fulfilled, (state) => {
        state.loading = false
      })
      
  },
})

export const { clearError } = queueSlice.actions
export default queueSlice.reducer


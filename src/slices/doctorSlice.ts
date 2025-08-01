import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { M_Doctor, M_ClinicQueue, UpdateDoctorDto } from "../types";
import { apiService } from "../services/api";

interface DoctorState {
  doctors: M_Doctor[];
  currentDoctor: M_Doctor | null;
  todayQueues: M_ClinicQueue[];
  clientsCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: DoctorState = {
  doctors: [],
  currentDoctor: null,
  todayQueues: [],
  clientsCount: 0,
  loading: false,
  error: null,
};

export const fetchAllDoctors = createAsyncThunk<M_Doctor[]>(
  "doctor/fetchAllDoctors",
  async () => {
    return await apiService.getAllDoctors();
  }
);

export const fetchDoctorQueuesForToday = createAsyncThunk<M_ClinicQueue[], string>(
  "doctor/fetchDoctorQueuesForToday",
  async (idNumber) => {
    return await apiService.getDoctorQueuesForToday(idNumber);
  }
);

export const fetchNumOfClientsForToday = createAsyncThunk<number, string>(
  "doctor/fetchNumOfClientsForToday",
  async (idNumber) => {
    return await apiService.getNumOfClientsForToday(idNumber);
  }
);

export const addDoctor = createAsyncThunk<M_Doctor, M_Doctor>(
  "doctor/addDoctor",
  async (doctor) => {
    await apiService.addDoctor(doctor);
    return doctor;
  }
);

export const deleteDoctor = createAsyncThunk<string, string>(
  "doctor/deleteDoctor",
  async (id) => {
    await apiService.deleteDoctor(id);
    return id;
  }
);

export const updateDoctor = createAsyncThunk<M_Doctor, UpdateDoctorDto>(
  "doctor/updateDoctor",
  async (updatedDoctor) => {
    const updated = await apiService.updateDoctor(updatedDoctor);
    return updated as M_Doctor;
  }
);

export const deleteADayOfWork = createAsyncThunk<
  void,
  { idNumber: string; day: string }
>(
  "doctor/deleteADayOfWork",
  async ({ idNumber, day }) => {
    await apiService.deleteADayOfWork(idNumber, day);
  }
);

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentDoctor: (state, action: PayloadAction<M_Doctor | null>) => {
      state.currentDoctor = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchAllDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch doctors";
      })
      .addCase(fetchDoctorQueuesForToday.fulfilled, (state, action) => {
        state.todayQueues = action.payload;
      })
      .addCase(fetchNumOfClientsForToday.fulfilled, (state, action) => {
        state.clientsCount = action.payload;
      })
      .addCase(addDoctor.fulfilled, (state, action) => {
        state.doctors.push(action.payload);
      })
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.doctors = state.doctors.filter((d) => d.idNumber !== action.payload);
      })
      .addCase(updateDoctor.fulfilled, (state, action) => {
        const index = state.doctors.findIndex((d) => d.idNumber === action.payload.idNumber);
        if (index !== -1) {
          state.doctors[index] = action.payload;
        }
      })
      .addCase(deleteADayOfWork.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteADayOfWork.fulfilled, (state) => {
        state.loading = false;
        state.todayQueues = [];
        state.clientsCount = 0;
      })
      .addCase(deleteADayOfWork.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete work day";
      });
  },
});

export const { clearError, setCurrentDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;

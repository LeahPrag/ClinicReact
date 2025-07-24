import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { M_Client } from "../types"
import { apiService } from "../services/api"

interface ClientState {
  clients: M_Client[]
  currentClient: M_Client | null
  loading: boolean
  error: string | null
}

const initialState: ClientState = {
  clients: [],
  currentClient: null,
  loading: false,
  error: null,
}

// Async thunks עם טיפוס Generic מתאים
export const fetchClients = createAsyncThunk<M_Client[]>(
  "client/fetchClients",
  async () => {
    return await apiService.getClients()
  }
)

export const fetchClientById = createAsyncThunk<M_Client, string>(
  "client/fetchClientById",
  async (id) => {
    return await apiService.getClientById(id)
  }
)

export const addClient = createAsyncThunk<M_Client, M_Client>(
  "client/addClient",
  async (client) => {
    await apiService.addClient(client)
    return client
  }
)

export const updateClient = createAsyncThunk<M_Client, M_Client>(
  "client/updateClient",
  async (client) => {
    await apiService.updateClient(client)
    return client
  }
)

export const deleteClient = createAsyncThunk<string, string>(
  "client/deleteClient",
  async (id) => {
    await apiService.deleteClient(id)
    return id
  }
)

const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentClient: (state, action: PayloadAction<M_Client | null>) => {
      state.currentClient = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch clients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false
        state.clients = action.payload
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch clients"
      })
      // Fetch client by ID
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.currentClient = action.payload
      })
      // Add client
      .addCase(addClient.fulfilled, (state, action) => {
        state.clients.push(action.payload)
      })
      // Update client
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex((c) => c.idNumber === action.payload.idNumber)
        if (index !== -1) {
          state.clients[index] = action.payload
        }
        if (state.currentClient?.idNumber === action.payload.idNumber) {
          state.currentClient = action.payload
        }
      })
      // Delete client
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter((c) => c.idNumber !== action.payload)
        if (state.currentClient?.idNumber === action.payload) {
          state.currentClient = null
        }
      })
  },
})

export const { clearError, setCurrentClient } = clientSlice.actions
export default clientSlice.reducer

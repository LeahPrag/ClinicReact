import { configureStore } from "@reduxjs/toolkit"
import clientReducer from "../slices/clientSlice"
import doctorReducer from "../slices/doctorSlice"
import queueReducer from "../slices/queueSlice"

export const store = configureStore({
  reducer: {
    client: clientReducer,
    doctor: doctorReducer,
    queue: queueReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

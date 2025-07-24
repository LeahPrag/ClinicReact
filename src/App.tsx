"use client"

import type React from "react"
import { Provider } from "react-redux"
import { store } from "./store/store"
import { UserProvider, useUser } from "./contexts/UserContext"
import Login from "./components/Login/Login"
import DoctorDashboard from "./components/Doctor/DoctorDashboard"
import ClientDashboard from "./components/Client/ClientDashboard"
import SecretaryDashboard from "./components/Secretary/SecretaryDashboard"
import "./App.css"

const AppContent: React.FC = () => {
  const { user } = useUser()

  if (!user) {
    return <Login />
  }

  switch (user.type) {
    case "Doctor":
      return <DoctorDashboard />
    case "Client":
      return <ClientDashboard />
    case "Secretary":
      return <SecretaryDashboard />
    default:
      return <Login />
  }
}

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <UserProvider>
        <div className="App">
          <AppContent />
        </div>
      </UserProvider>
    </Provider>
  )
}

export default App

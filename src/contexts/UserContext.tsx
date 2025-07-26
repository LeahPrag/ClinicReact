"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "../types"
import { authService } from "../services/authService"

interface UserContextType {
  user: User | null
  login: (id: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem("clinicUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])


  const login = async (id: string): Promise<boolean> => {
  setIsLoading(true);
  // setError(""); // Clear previous errors
  
  if (!id.trim()) {
    // setError("אנא הכנס תעודת זהות");
    setIsLoading(false);
    return false;
  }

  try {
    const userType = await authService.getUserType(id);
    console.log('User type response:', userType); // For debugging
    
    if (userType) {
      const newUser: User = { id, type: userType };

      // Get user name based on type
      if (userType === "Doctor") {
        const name = await authService.getDoctorName(id);
        newUser.name = name ;
      } else if (userType === "Client") {
        const name = await authService.getClientName(id);
        newUser.name = name ;
      } else if (userType === "Secretary") {
        newUser.name = "מזכירה";
      }

      setUser(newUser);
      localStorage.setItem("clinicUser", JSON.stringify(newUser));
      return true;
    }
    
    // setError("תעודת זהות לא נמצאה במערכת");
    return false;
  } catch (error) {
    console.error("Login error:", error);
    // console("שגיאה בחיבור לשרת. נסה שוב מאוחר יותר");
    return false;
  } finally {
    setIsLoading(false);
  }
}

  const logout = () => {
    setUser(null)
    localStorage.removeItem("clinicUser")
  }

  return <UserContext.Provider value={{ user, login, logout, isLoading }}>{children}</UserContext.Provider>
}

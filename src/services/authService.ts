import { apiService } from "./api"
import type { UserType } from "../types"

class AuthService {
  // async getUserType(id: string): Promise<UserType | null> {
  //   try {
  //     const userType = await apiService.getUserType(id)
  //     return userType as UserType
  //   } catch (error) {
  //     return null
  //   }
  // }
  async getUserType(id: string): Promise<UserType | null> {
  try {
    const userType = await apiService.getUserType(id);
    
    // Convert to proper type
    switch(userType.toLowerCase()) {
      case 'doctor': return 'Doctor';
      case 'client': return 'Client';
      case 'secretary': return 'Secretary';
      default: return null;
    }
  } catch (error) {
    console.error('Error getting user type:', error);
    return null;
  }
}

  async getDoctorName(id: string): Promise<string> {
    try {
      return await apiService.getDoctorName(id)
    } catch (error) {
      return ""
    }
  }

  async getClientName(id: string): Promise<string> {
    try {
      return await apiService.getClientName(id)
    } catch (error) {
      return ""
    }
  }
}

export const authService = new AuthService()

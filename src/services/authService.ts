import { apiService } from "./api"
import type { UserType } from "../types"
const API_BASE_URL = "http://localhost:5015/api/"
class AuthService {

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
    const res = await fetch(`${API_BASE_URL}Doctor/GetDoctorName?id=${id}`);
    if (!res.ok) throw new Error("Failed to fetch doctor name");
    const text = await res.text();  
    console.log("Response text:", text);
    return text.trim();
}
async getClientName(id: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}Clinic/GetClientName?id=${id}`);
  if (!res.ok) throw new Error("Failed to fetch client name");
  const text = await res.text();  
  console.log("Response text:", text);
  return text.trim();
}
}

export const authService = new AuthService()


import type { M_Client, M_Doctor, M_ClinicQueue, M_AvailableQueue,UpdateDoctorDto } from "../types"
const API_BASE_URL = "http://localhost:5015/api"

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data as T
  }


  async getUserType(id: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/LogIn/GetUserType?id=${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User not found');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  return text.trim(); // Remove any whitespace
}

  async getDoctorName(id: string): Promise<string> {
    return this.request<string>(`/Doctor/GetDoctorName?id=${id}`)
  }

  async getClientName(id: string): Promise<string> {
    return this.request<string>(`/Clinic/GetClientName?id=${id}`)
  }

  // Clinic endpoints
  async getAvailableQueuesForDay(firstName: string, lastName: string, date: string): Promise<any> {
    return this.request<any>(`/Clinic/availableQueuesForDay?firstName=${firstName}&lastName=${lastName}&date=${date}`)
  }

  async getAvailableQueuesForTodayClinic(firstName: string, lastName: string): Promise<any> {
    return this.request<any>(`/Clinic/availableQueuesForToday?firstName=${firstName}&lastName=${lastName}`)
  }





async makeAppointment(idDoctor: string, idClient: string, date: string, hour: number): Promise<string> {
  const url = new URL(`${API_BASE_URL}/Clinic/makeAppointment`);
  
  // Ensure parameters match Swagger exactly
  url.searchParams.append('idDoctor', idDoctor);
  url.searchParams.append('idClient', idClient);
  url.searchParams.append('date', date);
  url.searchParams.append('hour', hour.toString());

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "accept": "*/*",  // Must match Swagger
      "Content-Type": "application/json"  // Add this if your backend expects it
    },
    body: JSON.stringify({})  // Empty body like Swagger
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to make appointment");
  }

  return await response.text();
}

  async getClients(): Promise<M_Client[]> {
    return this.request<M_Client[]>("/Clinic/clients")
  }

  async getClientById(id: string): Promise<M_Client> {
    return this.request<M_Client>(`/Clinic/clients/${id}`)
  }

  async addClient(client: M_Client): Promise<M_Client> {
    return this.request<M_Client>("/Clinic/clients", {
      method: "POST",
      body: JSON.stringify(client),
    })
  }

  async updateClient(client: M_Client): Promise<M_Client> {
    return this.request<M_Client>("/Clinic/clients", {
      method: "PUT",
      body: JSON.stringify(client),
    })
  }

  async deleteClient(id: string): Promise<void> {
    return this.request<void>(`/Clinic/clients/${id}`, {
      method: "DELETE",
    })
  }

  // Doctor endpoints
  async getNumOfClientsForToday(idNumber: string): Promise<number> {
    return this.request<number>(`/Doctor/numOfClientsForToday?idNumber=${idNumber}`)
  }

  async getAllDoctors(): Promise<M_Doctor[]> {
    return this.request<M_Doctor[]>("/Doctor/getAllDoctors")
  }

  async getDoctorQueuesForToday(idNumber: string): Promise<M_ClinicQueue[]> {
    return this.request<M_ClinicQueue[]>(`/Doctor/DoctorQueuesForToday?idNumber=${idNumber}`)
  }

  async getAvailableQueuesForSpecialization(specialization: string): Promise<M_ClinicQueue[]> {
  const url = `${API_BASE_URL}/Doctor/availableQueuesForASpezesilation?spezesilation=${encodeURIComponent(specialization)}`
  const response = await fetch(url)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to fetch queues by specialization")
  }

  return await response.json()
}


  async getAvailableQueuesForToday(): Promise<M_AvailableQueue[]> {
    return this.request<M_AvailableQueue[]>("/Doctor/AvailableQueuesForToday")
  }

  async addDoctor(doctor: M_Doctor): Promise<M_Doctor> {
    return this.request<M_Doctor>("/Doctor/addDoctor", {
      method: "POST",
      body: JSON.stringify(doctor),
    })
  }

  async deleteADayOfWork(idNumber: string, day: string): Promise<void> {
    return this.request<void>(`/Doctor/deleteADayOfWork?idNumber=${idNumber}&day=${day}`, {
      method: "DELETE",
    })
  }

  async deleteDoctor(id: string): Promise<void> {
    return this.request<void>(`/Doctor/deleteADoctor?id=${id}`, {
      method: "DELETE",
    })
  }

  async updateDoctor(doctor: UpdateDoctorDto): Promise<M_Doctor> {
    return this.request<M_Doctor>("/Doctor/updateDoctor", {
      method: "PUT",
      body: JSON.stringify(doctor),
    })
  }
  
async getAvailableQueuesForDayAndSpec(
  date: string,
  doctorName?: string,
  specialization?: string | null
): Promise<M_AvailableQueue[]> {
  const params = new URLSearchParams();
  params.append("date", date);
  if (doctorName) params.append("doctorName", doctorName);
  if (specialization) params.append("specialization", specialization);
  
  const url = `${API_BASE_URL}/Clinic/availableQueuesForDay?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch available queues");
  }
  
  return await response.json();
}
}

export const apiService = new ApiService()



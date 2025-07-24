export interface M_Client {
  firstName: string
  lastName: string
  phone?: string
  email?: string
  address: string
  idNumber: string
  clinicQueues: M_ClinicQueue[]
}

export interface M_Doctor {
  doctorId: number
  firstName: string
  lastName: string
  specialization: string
  idNumber: string
}

export interface M_ClinicQueue {
  queueId: number
  appointmentDate: string
  clientId: number
  clientFirstName: string
  clientLastName: string
  doctorId: number
  doctorFirstName: string
  doctorLastName: string
}

export interface M_AvailableQueue {
  queueId: number
  appointmentDate: string
  doctorId: number
}

export interface UpdateDoctorDto {
  idNumber: string
  firstName?: string
  lastName?: string
  specialization?: string
}

export type UserType = "Doctor" | "Client" | "Secretary"

export interface User {
  id: string
  type: UserType
  name?: string
}

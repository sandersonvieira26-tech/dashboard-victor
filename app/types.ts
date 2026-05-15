export type AppointmentStatus = 'scheduled' | 'attended' | 'no-show'

export interface ClientData {
  id: string
  name: string
  phone: string
  isNew: boolean
  createdAt: string
}

export interface AppointmentData {
  id: string
  date: string
  status: AppointmentStatus
  clientId: string
  client: ClientData
  createdAt: string
}

export interface ClientWithAppointments extends ClientData {
  appointments: Array<{
    id: string
    date: string
    status: AppointmentStatus
  }>
}

export interface CreateAppointmentBody {
  name: string
  phone: string
  date: string
}

export interface UpdateStatusBody {
  status: AppointmentStatus
}

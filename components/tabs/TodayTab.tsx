import AppointmentRow from '@/components/AppointmentRow'
import type { AppointmentData, AppointmentStatus } from '@/app/types'

interface TodayTabProps {
  appointments: AppointmentData[]
  onStatusChange: (id: string, status: AppointmentStatus) => void
  updatingId: string | null
}

export default function TodayTab({ appointments, onStatusChange, updatingId }: TodayTabProps) {
  if (appointments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">Nenhum agendamento para hoje.</p>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {appointments.map((appt) => (
        <AppointmentRow
          key={appt.id}
          appointment={appt}
          onStatusChange={onStatusChange}
          isUpdating={updatingId === appt.id}
        />
      ))}
    </div>
  )
}

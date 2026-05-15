import AppointmentRow from '@/components/AppointmentRow'
import type { AppointmentData, AppointmentStatus } from '@/app/types'

interface NoShowsTabProps {
  appointments: AppointmentData[]
  onStatusChange: (id: string, status: AppointmentStatus) => void
  updatingId: string | null
}

export default function NoShowsTab({ appointments, onStatusChange, updatingId }: NoShowsTabProps) {
  if (appointments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">Nenhuma falta registrada.</p>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {appointments.map((appt) => (
        <AppointmentRow
          key={appt.id}
          appointment={appt}
          showDate
          onStatusChange={onStatusChange}
          isUpdating={updatingId === appt.id}
        />
      ))}
    </div>
  )
}

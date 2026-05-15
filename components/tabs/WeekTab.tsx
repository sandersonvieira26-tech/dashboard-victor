import AppointmentRow from '@/components/AppointmentRow'
import type { AppointmentData, AppointmentStatus } from '@/app/types'

interface WeekTabProps {
  appointments: AppointmentData[]
  onStatusChange: (id: string, status: AppointmentStatus) => void
  updatingId: string | null
}

function groupByDate(appointments: AppointmentData[]): Map<string, AppointmentData[]> {
  const groups = new Map<string, AppointmentData[]>()
  for (const appt of appointments) {
    const dateKey = appt.date.split('T')[0]
    const existing = groups.get(dateKey) ?? []
    existing.push(appt)
    groups.set(dateKey, existing)
  }
  return groups
}

function formatGroupDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00.000Z`)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    timeZone: 'UTC',
  })
}

export default function WeekTab({ appointments, onStatusChange, updatingId }: WeekTabProps) {
  if (appointments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        Nenhum agendamento para esta semana.
      </p>
    )
  }

  const groups = groupByDate(appointments)

  return (
    <div className="flex flex-col gap-4">
      {[...groups.entries()].map(([dateKey, appts]) => (
        <div key={dateKey}>
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {formatGroupDate(dateKey)}
          </div>
          <div className="flex flex-col gap-1.5">
            {appts.map((appt) => (
              <AppointmentRow
                key={appt.id}
                appointment={appt}
                onStatusChange={onStatusChange}
                isUpdating={updatingId === appt.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

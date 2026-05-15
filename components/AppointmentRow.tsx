import AttendanceToggle from '@/components/AttendanceToggle'
import type { AppointmentData, AppointmentStatus } from '@/app/types'

interface AppointmentRowProps {
  appointment: AppointmentData
  showDate?: boolean
  onStatusChange: (id: string, status: AppointmentStatus) => void
  isUpdating?: boolean
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default function AppointmentRow({
  appointment,
  showDate = false,
  onStatusChange,
  isUpdating = false,
}: AppointmentRowProps) {
  const { client } = appointment

  return (
    <div className="flex items-center gap-3 rounded-md bg-[#1e293b] px-3 py-2.5">
      {showDate && (
        <div className="w-24 shrink-0 text-xs text-slate-400">
          {formatDate(appointment.date)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="truncate text-xs font-medium text-slate-100">{client.name}</div>
        <div className="text-[10px] text-slate-500">{client.phone}</div>
      </div>
      {client.isNew && (
        <span className="shrink-0 rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-slate-900">
          NOVO
        </span>
      )}
      <AttendanceToggle
        status={appointment.status}
        onStatusChange={(status) => onStatusChange(appointment.id, status)}
        isLoading={isUpdating}
      />
    </div>
  )
}

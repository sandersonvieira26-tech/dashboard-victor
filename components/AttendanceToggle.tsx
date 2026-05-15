import type { AppointmentStatus } from '@/app/types'

interface AttendanceToggleProps {
  status: AppointmentStatus
  onStatusChange: (status: AppointmentStatus) => void
  isLoading?: boolean
}

export default function AttendanceToggle({
  status,
  onStatusChange,
  isLoading = false,
}: AttendanceToggleProps) {
  function handleAttend() {
    onStatusChange(status === 'attended' ? 'scheduled' : 'attended')
  }

  function handleNoShow() {
    onStatusChange(status === 'no-show' ? 'scheduled' : 'no-show')
  }

  const attendedActive = status === 'attended'
  const noShowActive = status === 'no-show'

  return (
    <div className="flex gap-1">
      <button
        onClick={handleAttend}
        disabled={isLoading}
        aria-label="✓ Marcar como compareceu"
        className={`rounded px-2.5 py-1 text-xs font-bold transition-colors disabled:opacity-50 ${
          attendedActive
            ? 'bg-green-900 text-green-400'
            : 'border border-slate-600 bg-[#1e293b] text-slate-500 hover:border-green-600 hover:text-green-400'
        }`}
      >
        ✓
      </button>
      <button
        onClick={handleNoShow}
        disabled={isLoading}
        aria-label="✗ Marcar como falta"
        className={`rounded px-2.5 py-1 text-xs font-bold transition-colors disabled:opacity-50 ${
          noShowActive
            ? 'bg-red-900 text-red-400'
            : 'border border-slate-600 bg-[#1e293b] text-slate-500 hover:border-red-600 hover:text-red-400'
        }`}
      >
        ✗
      </button>
    </div>
  )
}

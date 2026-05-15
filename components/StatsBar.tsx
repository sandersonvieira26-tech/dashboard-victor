interface StatsBarProps {
  total: number
  attended: number
  noShows: number
  newClients: number
  onNewAppointment: () => void
}

export default function StatsBar({
  total,
  attended,
  noShows,
  newClients,
  onNewAppointment,
}: StatsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-[#0f172a] border-b border-[#1e293b] px-4 py-3">
      <StatCard value={total} label="Hoje" valueClassName="text-slate-100" />
      <StatCard value={attended} label="Compareceram" valueClassName="text-green-400" />
      <StatCard value={noShows} label="Faltaram" valueClassName="text-red-400" />
      <StatCard value={newClients} label="Novos Clientes" valueClassName="text-amber-400" />
      <button
        onClick={onNewAppointment}
        className="ml-auto rounded-md bg-sky-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-sky-300 transition-colors"
      >
        + Novo Agendamento
      </button>
    </div>
  )
}

function StatCard({
  value,
  label,
  valueClassName,
}: {
  value: number
  label: string
  valueClassName: string
}) {
  return (
    <div className="rounded-md bg-[#1e293b] px-4 py-2 text-center min-w-[70px]">
      <div className={`text-xl font-bold ${valueClassName}`}>{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  )
}

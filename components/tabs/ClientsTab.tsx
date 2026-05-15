import type { ClientWithAppointments } from '@/app/types'

interface ClientsTabProps {
  clients: ClientWithAppointments[]
}

export default function ClientsTab({ clients }: ClientsTabProps) {
  if (clients.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">Nenhum cliente cadastrado.</p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {clients.map((client) => {
        const attended = client.appointments.filter((a) => a.status === 'attended').length
        const total = client.appointments.length
        return (
          <div key={client.id} className="rounded-md bg-[#1e293b] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-xs font-medium text-slate-100">{client.name}</div>
                <div className="text-[10px] text-slate-500">{client.phone}</div>
              </div>
              {client.isNew && (
                <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-slate-900">
                  NOVO
                </span>
              )}
              <div className="text-right text-[10px] text-slate-400">
                <div>{total} agendamento{total !== 1 ? 's' : ''}</div>
                <div className="text-green-400">{attended} compareceu</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

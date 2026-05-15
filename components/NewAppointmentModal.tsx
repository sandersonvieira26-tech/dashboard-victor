'use client'

import { useState } from 'react'

interface NewAppointmentModalProps {
  onClose: () => void
  onSubmit: (data: { name: string; phone: string; date: string }) => Promise<void>
  isSubmitting?: boolean
}

export default function NewAppointmentModal({
  onClose,
  onSubmit,
  isSubmitting = false,
}: NewAppointmentModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)

  const disabled = isSubmitting || loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !date) return
    setLoading(true)
    try {
      await onSubmit({ name: name.trim(), phone: phone.trim(), date })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      data-testid="modal-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div className="w-full max-w-md rounded-lg bg-[#0f172a] border border-[#1e293b] p-6 shadow-xl">
        <h2 className="mb-4 text-base font-bold text-slate-100">Novo Agendamento</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-xs font-semibold uppercase text-slate-400">
              Nome do Cliente
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={disabled}
              placeholder="Ex: João Silva"
              className="rounded bg-[#1e293b] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-1 focus:ring-sky-400 disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-xs font-semibold uppercase text-slate-400">
              Telefone
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={disabled}
              placeholder="(11) 9xxxx-xxxx"
              className="rounded bg-[#1e293b] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-1 focus:ring-sky-400 disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="date" className="text-xs font-semibold uppercase text-slate-400">
              Data
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={disabled}
              className="rounded bg-[#1e293b] px-3 py-2 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-sky-400 disabled:opacity-50"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={disabled}
              className="flex-1 rounded bg-sky-400 py-2 text-sm font-bold text-slate-900 hover:bg-sky-300 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Salvando...' : 'Salvar Agendamento'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={disabled}
              className="rounded bg-[#1e293b] px-4 py-2 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

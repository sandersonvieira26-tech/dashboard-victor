'use client'

import { useState, useEffect, useCallback } from 'react'
import StatsBar from '@/components/StatsBar'
import NewAppointmentModal from '@/components/NewAppointmentModal'
import TodayTab from '@/components/tabs/TodayTab'
import WeekTab from '@/components/tabs/WeekTab'
import ClientsTab from '@/components/tabs/ClientsTab'
import NoShowsTab from '@/components/tabs/NoShowsTab'
import type { AppointmentData, AppointmentStatus, ClientWithAppointments } from '@/app/types'

type Tab = 'hoje' | 'semana' | 'clientes' | 'faltas'

const TAB_LABELS: Record<Tab, string> = {
  hoje: 'Hoje',
  semana: 'Semana',
  clientes: 'Clientes',
  faltas: 'Faltas',
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('hoje')
  const [todayAppointments, setTodayAppointments] = useState<AppointmentData[]>([])
  const [weekAppointments, setWeekAppointments] = useState<AppointmentData[]>([])
  const [noShowAppointments, setNoShowAppointments] = useState<AppointmentData[]>([])
  const [clients, setClients] = useState<ClientWithAppointments[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setFetchError(null)
    try {
      const [todayRes, weekRes, noShowRes, clientsRes] = await Promise.all([
        fetch('/api/appointments?mode=day'),
        fetch('/api/appointments?mode=week'),
        fetch('/api/appointments?mode=no-shows'),
        fetch('/api/clients'),
      ])
      const [today, week, noShows, clientsData] = await Promise.all([
        todayRes.json(),
        weekRes.json(),
        noShowRes.json(),
        clientsRes.json(),
      ])
      setTodayAppointments(Array.isArray(today) ? today : [])
      setWeekAppointments(Array.isArray(week) ? week : [])
      setNoShowAppointments(Array.isArray(noShows) ? noShows : [])
      setClients(Array.isArray(clientsData) ? clientsData : [])
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setFetchError('Falha ao carregar dados. Tente novamente.')
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        await fetchData()
      } else {
        setFetchError('Erro ao atualizar status. Tente novamente.')
        await fetchData()
      }
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleCreateAppointment(data: {
    name: string
    phone: string
    date: string
  }) {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create appointment')
      await fetchData()
    } finally {
      setIsSubmitting(false)
    }
  }

  const todayAttended = todayAppointments.filter((a) => a.status === 'attended').length
  const todayNoShows = todayAppointments.filter((a) => a.status === 'no-show').length
  const todayNewClients = todayAppointments.filter((a) => a.client.isNew).length

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <header className="border-b border-[#1e293b] px-4 py-3">
        <h1 className="text-sm font-bold text-slate-100">Dashboard de Agendamentos</h1>
      </header>

      <StatsBar
        total={todayAppointments.length}
        attended={todayAttended}
        noShows={todayNoShows}
        newClients={todayNewClients}
        onNewAppointment={() => setIsModalOpen(true)}
      />

      {fetchError && (
        <div className="mx-4 mt-3 rounded bg-red-900/40 px-4 py-2 text-xs text-red-400">
          {fetchError}
        </div>
      )}

      {/* Tab navigation */}
      <nav className="flex border-b border-[#1e293b] bg-[#0f172a] px-4">
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-sky-400 text-sky-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <main className="p-4">
        {activeTab === 'hoje' && (
          <TodayTab
            appointments={todayAppointments}
            onStatusChange={handleStatusChange}
            updatingId={updatingId}
          />
        )}
        {activeTab === 'semana' && (
          <WeekTab
            appointments={weekAppointments}
            onStatusChange={handleStatusChange}
            updatingId={updatingId}
          />
        )}
        {activeTab === 'clientes' && <ClientsTab clients={clients} />}
        {activeTab === 'faltas' && (
          <NoShowsTab
            appointments={noShowAppointments}
            onStatusChange={handleStatusChange}
            updatingId={updatingId}
          />
        )}
      </main>

      {isModalOpen && (
        <NewAppointmentModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateAppointment}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

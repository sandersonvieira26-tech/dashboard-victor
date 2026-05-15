import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppointmentRow from '@/components/AppointmentRow'
import type { AppointmentData } from '@/app/types'

const baseAppointment: AppointmentData = {
  id: 'appt-1',
  date: '2026-05-15T00:00:00.000Z',
  status: 'scheduled',
  clientId: 'client-1',
  client: {
    id: 'client-1',
    name: 'Ana Lima',
    phone: '(11) 99999-0001',
    isNew: true,
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  createdAt: '2026-05-01T00:00:00.000Z',
}

describe('AppointmentRow', () => {
  it('renders client name and phone', () => {
    render(<AppointmentRow appointment={baseAppointment} onStatusChange={jest.fn()} />)
    expect(screen.getByText('Ana Lima')).toBeInTheDocument()
    expect(screen.getByText('(11) 99999-0001')).toBeInTheDocument()
  })

  it('shows NOVO badge when client isNew is true', () => {
    render(<AppointmentRow appointment={baseAppointment} onStatusChange={jest.fn()} />)
    expect(screen.getByText('NOVO')).toBeInTheDocument()
  })

  it('does not show NOVO badge when client isNew is false', () => {
    const appt = { ...baseAppointment, client: { ...baseAppointment.client, isNew: false } }
    render(<AppointmentRow appointment={appt} onStatusChange={jest.fn()} />)
    expect(screen.queryByText('NOVO')).not.toBeInTheDocument()
  })

  it('calls onStatusChange with appointment id and new status', async () => {
    const onStatusChange = jest.fn()
    render(<AppointmentRow appointment={baseAppointment} onStatusChange={onStatusChange} />)
    await userEvent.click(screen.getByRole('button', { name: /✓/ }))
    expect(onStatusChange).toHaveBeenCalledWith('appt-1', 'attended')
  })
})

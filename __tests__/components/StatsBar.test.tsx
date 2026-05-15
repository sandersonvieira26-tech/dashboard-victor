import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StatsBar from '@/components/StatsBar'

describe('StatsBar', () => {
  const defaultProps = {
    total: 8,
    attended: 5,
    noShows: 2,
    newClients: 3,
    onNewAppointment: jest.fn(),
  }

  it('renders all four stat cards with correct values', () => {
    render(<StatsBar {...defaultProps} />)
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Hoje')).toBeInTheDocument()
    expect(screen.getByText('Compareceram')).toBeInTheDocument()
    expect(screen.getByText('Faltaram')).toBeInTheDocument()
    expect(screen.getByText('Novos Clientes')).toBeInTheDocument()
  })

  it('renders the new appointment button', () => {
    render(<StatsBar {...defaultProps} />)
    expect(screen.getByRole('button', { name: /novo agendamento/i })).toBeInTheDocument()
  })

  it('calls onNewAppointment when button is clicked', async () => {
    const onNewAppointment = jest.fn()
    render(<StatsBar {...defaultProps} onNewAppointment={onNewAppointment} />)
    await userEvent.click(screen.getByRole('button', { name: /novo agendamento/i }))
    expect(onNewAppointment).toHaveBeenCalledTimes(1)
  })
})

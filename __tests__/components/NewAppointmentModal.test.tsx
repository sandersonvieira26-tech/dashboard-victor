import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewAppointmentModal from '@/components/NewAppointmentModal'

describe('NewAppointmentModal', () => {
  const onClose = jest.fn()
  const onSubmit = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders all three form fields', () => {
    render(<NewAppointmentModal onClose={onClose} onSubmit={onSubmit} />)
    expect(screen.getByLabelText(/nome do cliente/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
  })

  it('calls onClose when Cancelar is clicked', async () => {
    render(<NewAppointmentModal onClose={onClose} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmit with form data and then closes when form is valid', async () => {
    onSubmit.mockResolvedValue(undefined)
    render(<NewAppointmentModal onClose={onClose} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/nome do cliente/i), 'João Silva')
    await userEvent.type(screen.getByLabelText(/telefone/i), '(11) 99999-0001')
    fireEvent.change(screen.getByLabelText(/data/i), { target: { value: '2026-05-20' } })

    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'João Silva',
        phone: '(11) 99999-0001',
        date: '2026-05-20',
      })
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('does not call onSubmit when fields are empty', async () => {
    render(<NewAppointmentModal onClose={onClose} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onClose when backdrop is clicked', async () => {
    render(<NewAppointmentModal onClose={onClose} onSubmit={onSubmit} />)
    // The backdrop is the outer div that triggers close when clicked directly
    const backdrop = screen.getByTestId('modal-backdrop')
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('disables form controls when isSubmitting is true', () => {
    render(<NewAppointmentModal onClose={onClose} onSubmit={onSubmit} isSubmitting={true} />)
    expect(screen.getByLabelText(/nome do cliente/i)).toBeDisabled()
    expect(screen.getByLabelText(/telefone/i)).toBeDisabled()
    expect(screen.getByLabelText(/data/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /salvar/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled()
  })

  it('does not close when clicking inside the modal dialog', async () => {
    render(<NewAppointmentModal onClose={onClose} onSubmit={onSubmit} />)
    // Click the modal box itself (not the backdrop)
    const modalBox = screen.getByRole('heading', { name: /novo agendamento/i }).closest('div')!
    await userEvent.click(modalBox)
    expect(onClose).not.toHaveBeenCalled()
  })
})

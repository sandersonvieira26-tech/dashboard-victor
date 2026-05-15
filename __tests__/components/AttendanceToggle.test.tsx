import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AttendanceToggle from '@/components/AttendanceToggle'
import type { AppointmentStatus } from '@/app/types'

describe('AttendanceToggle', () => {
  const onStatusChange = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders both toggle buttons', () => {
    render(<AttendanceToggle status="scheduled" onStatusChange={onStatusChange} />)
    expect(screen.getByRole('button', { name: /✓/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /✗/ })).toBeInTheDocument()
  })

  it('calls onStatusChange with attended when ✓ is clicked on scheduled status', async () => {
    render(<AttendanceToggle status="scheduled" onStatusChange={onStatusChange} />)
    await userEvent.click(screen.getByRole('button', { name: /✓/ }))
    expect(onStatusChange).toHaveBeenCalledWith('attended')
  })

  it('calls onStatusChange with scheduled (toggle off) when ✓ is clicked on attended status', async () => {
    render(<AttendanceToggle status="attended" onStatusChange={onStatusChange} />)
    await userEvent.click(screen.getByRole('button', { name: /✓/ }))
    expect(onStatusChange).toHaveBeenCalledWith('scheduled')
  })

  it('calls onStatusChange with no-show when ✗ is clicked on scheduled status', async () => {
    render(<AttendanceToggle status="scheduled" onStatusChange={onStatusChange} />)
    await userEvent.click(screen.getByRole('button', { name: /✗/ }))
    expect(onStatusChange).toHaveBeenCalledWith('no-show')
  })

  it('calls onStatusChange with scheduled (toggle off) when ✗ is clicked on no-show status', async () => {
    render(<AttendanceToggle status="no-show" onStatusChange={onStatusChange} />)
    await userEvent.click(screen.getByRole('button', { name: /✗/ }))
    expect(onStatusChange).toHaveBeenCalledWith('scheduled')
  })

  it('disables both buttons when isLoading is true', async () => {
    render(<AttendanceToggle status="scheduled" onStatusChange={onStatusChange} isLoading={true} />)
    expect(screen.getByRole('button', { name: /✓/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /✗/ })).toBeDisabled()
  })
})

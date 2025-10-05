import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@/test/test-utils'
import {TicketDetails} from '@/components/TicketDetails'
import {TicketStatus} from '@/enums/TicketStatus'
import {Priority} from '@/enums/Priority'
import type {Ticket} from '@/types/ticket'

// Add environment variable mocks
vi.mock('@/services/communication', () => ({
    default: {
        instance: {
            connect: vi.fn(),
            disconnect: vi.fn(),
            on: vi.fn(),
            off: vi.fn(),
            invoke: vi.fn()
        }
    }
}))

vi.mock('@/hooks/useCommunicationService', () => ({
    useCommunicationService: vi.fn().mockReturnValue({
        isConnected: true,
        connect: vi.fn(),
        disconnect: vi.fn()
    })
}))

const mockTicket: Ticket = {
    id: '1',
    title: 'Test Ticket',
    description: 'This is a test ticket description',
    status: TicketStatus.Open,
    priority: Priority.High,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    assignedAgentId: 'agent1',
    assignedAgent: 'Agent Smith'
}

describe('TicketDetails Component', () => {
    const defaultProps = {
        ticket: mockTicket,
        onClose: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()

        // Mock import.meta.env
        vi.stubGlobal('import.meta', {
            env: {
                VITE_API_URL: 'http://localhost:3000/api',
                VITE_SIGNALR_URL: 'http://localhost:3000/hub',
                MODE: 'test',
                DEV: true
            }
        })
    })

    it('renders ticket details correctly', () => {
        render(<TicketDetails {...defaultProps} />)

        expect(screen.getByRole('heading', {name: /ticket #1/i})).toBeInTheDocument()
        expect(screen.getByText('Test Ticket')).toBeInTheDocument()
        expect(screen.getByText('This is a test ticket description')).toBeInTheDocument()
    })

    it('has a delete button when onDelete is provided', () => {
        render(<TicketDetails {...defaultProps} />)

        const deleteButton = screen.getByRole('button', {name: /delete/i})
        expect(deleteButton).toBeInTheDocument()
    })
})

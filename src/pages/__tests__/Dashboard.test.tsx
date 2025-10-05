import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@/test/test-utils'
import Dashboard from '@/pages/Dashboard'
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

const mockTickets: Ticket[] = [
    {
        id: '1',
        title: 'Login Issue',
        description: 'Cannot log into the system',
        status: TicketStatus.Open,
        priority: Priority.High,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
        assignedAgentId: 'agent1',
        assignedAgent: 'Agent Smith'
    },
    {
        id: '2',
        title: 'Payment Problem',
        description: 'Payment not processing correctly',
        status: TicketStatus.InProgress,
        priority: Priority.Medium,
        createdAt: '2024-01-02T11:00:00Z',
        updatedAt: '2024-01-02T11:00:00Z',
        assignedAgentId: 'agent2',
        assignedAgent: 'Agent Johnson'
    },
    {
        id: '3',
        title: 'Bug Report',
        description: 'Found a critical bug',
        status: TicketStatus.Resolved,
        priority: Priority.Critical,
        createdAt: '2024-01-03T12:00:00Z',
        updatedAt: '2024-01-03T12:00:00Z',
        assignedAgentId: 'agent1',
        assignedAgent: 'Agent Smith'
    }
]

describe('Dashboard Page', () => {
    const defaultProps = {
        tickets: mockTickets
    }

    beforeEach(() => {
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

    it('renders dashboard title', () => {
        render(<Dashboard {...defaultProps} />)

        expect(screen.getByRole('heading', {name: /dashboard/i})).toBeInTheDocument()
    })

    it('shows recent tickets section', () => {
        render(<Dashboard {...defaultProps} />)

        expect(screen.getByText(/recent tickets/i)).toBeInTheDocument()
    })

    it('displays tickets in recent tickets list', () => {
        render(<Dashboard {...defaultProps} />)

        expect(screen.getByText('Login Issue')).toBeInTheDocument()
        expect(screen.getByText(/cannot log into the system/i)).toBeInTheDocument()
        expect(screen.getByText('Payment Problem')).toBeInTheDocument()
        expect(screen.getByText(/payment not processing correctly/i)).toBeInTheDocument()
    })

    it('shows empty state when no tickets', () => {
        render(<Dashboard tickets={[]} />)

        expect(screen.getByText(/no tickets found/i)).toBeInTheDocument()
    })
})

import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@/test/test-utils'
import {TicketList} from '@/components/TicketList'
import {TicketStatus} from '@/enums/TicketStatus'
import {Priority} from '@/enums/Priority'
import type {Ticket} from '@/types/ticket'
import userEvent from "@testing-library/user-event";

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

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
    }
]

describe('TicketList Component', () => {
    const defaultProps = {
        tickets: mockTickets,
        onTicketClick: vi.fn(),
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

    it('renders ticket list with correct title', () => {
        render(<TicketList {...defaultProps} />)
        expect(screen.getByRole('heading', {name: /support tickets/i})).toBeInTheDocument()
    })

    it('displays all tickets when no filters are applied', () => {
        render(<TicketList {...defaultProps} />)
        expect(screen.getByText('Login Issue')).toBeInTheDocument()
        expect(screen.getByText('Payment Problem')).toBeInTheDocument()
    })

    it('filters tickets by search query', async () => {
        const user = userEvent.setup()
        render(<TicketList {...defaultProps} />)

        const searchInput = screen.getByPlaceholderText(/search tickets/i)
        await user.type(searchInput, 'login')

        expect(screen.getByText('Login Issue')).toBeInTheDocument()
        expect(screen.queryByText('Payment Problem')).not.toBeInTheDocument()
    })

    it('navigates to create ticket page when create button is clicked', async () => {
        const user = userEvent.setup()
        render(<TicketList {...defaultProps} />)

        const createButton = screen.getByRole('button', {name: /create ticket/i})
        await user.click(createButton)

        expect(mockNavigate).toHaveBeenCalledWith('/tickets/create')
    })

    it('displays empty state when no tickets match filters', async () => {
        const user = userEvent.setup()
        render(<TicketList {...defaultProps} />)

        const searchInput = screen.getByPlaceholderText(/search tickets/i)
        await user.type(searchInput, 'nonexistent')

        expect(screen.getByText(/no tickets found/i)).toBeInTheDocument()
    })

    it('displays ticket priorities correctly', () => {
        render(<TicketList {...defaultProps} />)
        expect(screen.getByText('High')).toBeInTheDocument()
        expect(screen.getByText('Medium')).toBeInTheDocument()
    })

    it('displays ticket statuses correctly', () => {
        render(<TicketList {...defaultProps} />)
        expect(screen.getByText('Open')).toBeInTheDocument()
        // InProgress is displayed as "InProgress" not "In Progress"
        expect(screen.getByText('InProgress')).toBeInTheDocument()
    })

    it('renders with empty ticket list', () => {
        render(<TicketList tickets={[]} onTicketClick={vi.fn()}/>)
        expect(screen.getByRole('heading', {name: /support tickets/i})).toBeInTheDocument()
    })

    it('renders ticket list with correct tickets', () => {
        render(<TicketList {...defaultProps} />)

        expect(screen.getByText('Login Issue')).toBeInTheDocument()
        expect(screen.getByText('Payment Problem')).toBeInTheDocument()
    })

    it('shows empty state when no tickets', () => {
        render(<TicketList tickets={[]} onTicketClick={defaultProps.onTicketClick}/>)

        expect(screen.getByText(/no tickets found/i)).toBeInTheDocument()
    })
})

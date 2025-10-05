import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@/test/test-utils'
import CreateTicket from '@/pages/CreateTicket'

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

describe('CreateTicket Page', () => {
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

    it('renders create ticket form', () => {
        render(<CreateTicket/>)

        expect(screen.getByRole('heading', {name: /create new ticket/i})).toBeInTheDocument()
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })

    it('has cancel button', async () => {
        render(<CreateTicket/>)

        const cancelButton = screen.getByRole('button', {name: /cancel/i})
        expect(cancelButton).toBeInTheDocument()
    })
})

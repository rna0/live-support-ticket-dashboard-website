import type {ReactNode} from 'react'
import {BrowserRouter} from 'react-router-dom'
import type {AuthContextType} from '@/context/AuthContextTypes'
import {AuthContext} from '@/context/AuthContextTypes'
import {vi} from 'vitest'

// Create mock auth context values with the correct structure
const mockAuthContext: AuthContextType = {
    isConnected: true,
    isInitialized: true,
    currentAgentId: 'test-agent-id',
    currentAgentName: 'Test Agent',
    currentAgentEmail: 'test@example.com',
    error: null,
    isAuthenticating: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getTickets: vi.fn(),
    getTicket: vi.fn(),
    getAllAgents: vi.fn(),
    createTicket: vi.fn(),
    updateTicketStatus: vi.fn(),
    assignTicket: vi.fn(),
    deleteTicket: vi.fn(),
    onTicketCreated: vi.fn(),
    onTicketUpdated: vi.fn(),
    onTicketStatusChanged: vi.fn()
}

/**
 * Provider component for test environment
 * Wraps components with necessary providers for testing
 */
export const AllTheProviders = ({children}: { children: ReactNode }) => {
    return (
        <BrowserRouter>
            <AuthContext.Provider value={mockAuthContext}>
                {children}
            </AuthContext.Provider>
        </BrowserRouter>
    )
}

import {beforeAll, describe, expect, it, vi} from 'vitest'
import {renderHook} from '@testing-library/react'
import {useAuth} from '../useAuth'
import {AuthContext} from '@/context/AuthContextTypes'
import {type ReactNode} from 'react'

// Mock modules that depend on environment variables
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

// Mock the AuthContext value with the correct type structure
const mockAuthContext = {
    isConnected: true,
    isInitialized: true,
    currentAgentId: 'test-id',
    currentAgentName: 'Test User',
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

// Create a wrapper component for the context provider
const wrapper = ({children}: { children: ReactNode }) => (
    <AuthContext.Provider value={mockAuthContext}>
        {children}
    </AuthContext.Provider>
)

describe('useAuth hook', () => {
    beforeAll(() => {
        // Mock import.meta.env in case it's not set in setup.ts
        vi.stubGlobal('import.meta', {
            env: {
                VITE_API_URL: 'http://localhost:3000/api',
                VITE_SIGNALR_URL: 'http://localhost:3000/hub',
                MODE: 'test',
                DEV: true
            }
        })
    })

    it('returns the auth context value', () => {
        const {result} = renderHook(() => useAuth(), {wrapper})

        expect(result.current).toEqual(mockAuthContext)
    })

    it('throws an error when used outside of AuthProvider', () => {
        // Use console.error spy to suppress the expected error in test output
        const consoleSpy = vi.spyOn(console, 'error')
        consoleSpy.mockImplementation(() => {
        })

        // The hook should throw an error when used outside of AuthProvider
        expect(() => {
            renderHook(() => useAuth())
        }).toThrow('useAuth must be used within AuthProvider')

        consoleSpy.mockRestore()
    })
})

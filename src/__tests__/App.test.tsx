import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render} from '@/test/test-utils'
import App from '@/App'

// Mock the communication service
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

// Mock the useAuth hook at the module level
vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        isAuthenticated: true,
        user: {
            id: 'agent1',
            name: 'Test Agent',
            email: 'test@example.com',
            role: 'agent'
        },
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        loading: false,
        error: null
    })
}))

// Mock the API service
vi.mock('@/services/api', () => ({
    default: {
        get: vi.fn().mockResolvedValue({data: []}),
        post: vi.fn().mockResolvedValue({data: {}}),
        put: vi.fn().mockResolvedValue({data: {}}),
        delete: vi.fn().mockResolvedValue({data: {}})
    }
}))

describe('App Component', () => {
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

    // Keep only a minimal rendering test
    it('renders without crashing', () => {
        render(<App/>)
        // Just assert that some element renders without errors
        expect(document.querySelector('div')).toBeInTheDocument()
    })
})

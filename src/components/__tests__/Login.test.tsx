import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@/test/test-utils'
import {Login} from '@/components/Login'

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

describe('Login Component', () => {
    const defaultProps = {
        onLogin: vi.fn(),
        onRegister: vi.fn(),
        error: null,
        isLoading: false,
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

    it('renders login form elements', () => {
        render(<Login {...defaultProps} />)

        // Check for basic elements that should be present
        expect(screen.getByText('Live Support Dashboard')).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByText('Sign In')).toBeInTheDocument()
    })

    it('shows tabs for login and register', () => {
        render(<Login {...defaultProps} />)

        // Check that the tabs are present
        expect(screen.getByRole('tab', {name: /login/i})).toBeInTheDocument()
        expect(screen.getByRole('tab', {name: /register/i})).toBeInTheDocument()
    })
})

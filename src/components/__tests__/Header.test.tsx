import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@/test/test-utils'
import {Header} from '@/components/Header'

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

describe('Header Component', () => {
    const defaultProps = {
        onMenuClick: vi.fn(),
        agentName: 'John Doe',
        isOnline: true,
        onLogout: vi.fn(),
    }

    beforeAll(() => {
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

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('does not render logout button when onLogout is not provided', () => {
        const { /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
            onLogout,
            ...propsWithoutLogout
        } = defaultProps
        render(<Header {...propsWithoutLogout} />)

        // The logout button should not be in the document
        expect(screen.queryByText('Logout')).not.toBeInTheDocument()
    })
})

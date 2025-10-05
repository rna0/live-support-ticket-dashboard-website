import '@testing-library/jest-dom'
import {cleanup} from '@testing-library/react'
import {afterEach, beforeAll, vi} from 'vitest'

// Mock environment variables needed by tests
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

// runs a cleanup after each test case
afterEach(() => {
    cleanup()
})

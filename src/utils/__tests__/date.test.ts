import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {formatDateCompact, formatDateFull, formatRelativeTime} from '@/utils/date'

describe('Date Utilities', () => {
    const mockDate = new Date('2024-01-15T14:30:00Z')

    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(mockDate)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('formatDateCompact', () => {
        it('formats date correctly', () => {
            const date = '2024-01-15T10:30:00Z'
            const result = formatDateCompact(date)
            expect(result).toContain('Jan')
            expect(result).toContain('15')
        })

        it('handles Date objects', () => {
            const date = new Date('2024-01-10T10:30:00Z')
            const result = formatDateCompact(date)
            expect(result).toBeTruthy()
        })

        it('handles invalid dates', () => {
            const result = formatDateCompact('invalid-date')
            expect(result).toBe('')
        })
    })

    describe('formatDateFull', () => {
        it('formats full date correctly', () => {
            const date = '2024-01-15T14:30:00Z'
            const result = formatDateFull(date)
            expect(result).toContain('Jan')
            expect(result).toContain('15')
            expect(result).toContain('2024')
        })

        it('handles undefined input', () => {
            const result = formatDateFull(undefined)
            expect(result).toBe('')
        })

        it('handles invalid dates', () => {
            const result = formatDateFull('invalid-date')
            expect(result).toBe('')
        })
    })

    describe('formatRelativeTime', () => {
        it('returns "just now" for very recent times', () => {
            const recent = new Date('2024-01-15T14:29:30Z').toISOString()
            expect(formatRelativeTime(recent)).toBe('just now')
        })

        it('returns minutes ago for recent times', () => {
            const fiveMinutesAgo = new Date('2024-01-15T14:25:00Z').toISOString()
            expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago')
        })

        it('returns hours ago for older times today', () => {
            const twoHoursAgo = new Date('2024-01-15T12:30:00Z').toISOString()
            expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago')
        })

        it('returns days ago for recent days', () => {
            const twoDaysAgo = new Date('2024-01-13T14:30:00Z').toISOString()
            expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago')
        })

        it('returns formatted date for older dates', () => {
            const oldDate = new Date('2023-12-01T10:00:00Z').toISOString()
            const result = formatRelativeTime(oldDate)
            expect(result).toContain('Dec')
        })
    })
})

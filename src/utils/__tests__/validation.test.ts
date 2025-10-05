import {describe, expect, it} from 'vitest'
import {isValidEmail, validateTicketDescription, validateTicketTitle} from '@/utils/validation'

describe('Validation Utilities', () => {
    describe('isValidEmail', () => {
        it('validates correct email addresses', () => {
            expect(isValidEmail('test@example.com')).toBe(true)
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
            expect(isValidEmail('user+tag@example.org')).toBe(true)
        })

        it('rejects invalid email addresses', () => {
            expect(isValidEmail('invalid-email')).toBe(false)
            expect(isValidEmail('test@')).toBe(false)
            expect(isValidEmail('@example.com')).toBe(false)
            expect(isValidEmail('')).toBe(false)
        })
    })

    describe('validateTicketTitle', () => {
        it('validates titles with appropriate length', () => {
            const result = validateTicketTitle('Valid ticket title')
            expect(result.isValid).toBe(true)
            expect(result.error).toBeUndefined()
        })

        it('rejects empty titles', () => {
            const result = validateTicketTitle('')
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Title is required')
        })

        it('rejects titles that are too short', () => {
            const result = validateTicketTitle('ab')
            expect(result.isValid).toBe(false)
            expect(result.error).toContain('at least 3 characters')
        })

        it('rejects titles that are too long', () => {
            const result = validateTicketTitle('a'.repeat(201))
            expect(result.isValid).toBe(false)
            expect(result.error).toContain('less than 200 characters')
        })
    })

    describe('validateTicketDescription', () => {
        it('validates descriptions with appropriate length', () => {
            const result = validateTicketDescription('This is a valid description')
            expect(result.isValid).toBe(true)
            expect(result.error).toBeUndefined()
        })

        it('accepts undefined descriptions', () => {
            const result = validateTicketDescription(undefined)
            expect(result.isValid).toBe(true)
        })

        it('rejects descriptions that are too long', () => {
            const result = validateTicketDescription('a'.repeat(2001))
            expect(result.isValid).toBe(false)
            expect(result.error).toContain('less than 2000 characters')
        })
    })
})

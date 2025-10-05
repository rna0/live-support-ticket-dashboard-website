import {describe, expect, it} from 'vitest'
import {getAssignedAgentName, getPriorityColorClasses, getStatusColorClasses,} from '@/utils/ticket'
import {TicketStatus} from '@/enums/TicketStatus'
import {Priority} from '@/enums/Priority'
import type {Ticket} from '@/types/ticket'

describe('Ticket Utilities', () => {
    const mockTicket: Ticket = {
        id: '1',
        title: 'Test Ticket',
        description: 'Test description',
        status: TicketStatus.Open,
        priority: Priority.High,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
        assignedAgentId: 'agent1',
        assignedAgent: 'Agent Smith'
    }

    describe('getStatusColorClasses', () => {
        it('returns correct classes for Open status', () => {
            const classes = getStatusColorClasses(TicketStatus.Open)
            expect(classes).toContain('bg-blue-500')
        })

        it('returns correct classes for In Progress status', () => {
            const classes = getStatusColorClasses(TicketStatus.InProgress)
            expect(classes).toContain('bg-orange-500')
        })

        it('returns correct classes for Resolved status', () => {
            const classes = getStatusColorClasses(TicketStatus.Resolved)
            expect(classes).toContain('bg-green-500')
        })
    })

    describe('getPriorityColorClasses', () => {
        it('returns correct classes for Low priority', () => {
            const classes = getPriorityColorClasses(Priority.Low)
            expect(classes).toContain('bg-green-500')
        })

        it('returns correct classes for Medium priority', () => {
            const classes = getPriorityColorClasses(Priority.Medium)
            expect(classes).toContain('bg-yellow-500')
        })

        it('returns correct classes for High priority', () => {
            const classes = getPriorityColorClasses(Priority.High)
            expect(classes).toContain('bg-orange-500')
        })

        it('returns correct classes for Critical priority', () => {
            const classes = getPriorityColorClasses(Priority.Critical)
            expect(classes).toContain('bg-red-500')
        })
    })

    describe('getAssignedAgentName', () => {
        it('returns agent name when assigned', () => {
            const name = getAssignedAgentName(mockTicket)
            expect(name).toBe('Agent Smith')
        })

        it('returns "Unassigned" when no agent is assigned', () => {
            const unassignedTicket = {...mockTicket, assignedAgent: undefined, assignedAgentId: undefined}
            const name = getAssignedAgentName(unassignedTicket)
            expect(name).toBe('Unassigned')
        })

        it('returns agent ID when agent name is not available', () => {
            const ticketWithIdOnly = {...mockTicket, assignedAgent: undefined, assignedAgentId: 'agent123'}
            const name = getAssignedAgentName(ticketWithIdOnly)
            expect(name).toBe('agent123')
        })
    })
})

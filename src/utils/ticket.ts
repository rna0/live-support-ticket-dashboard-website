/**
 * Ticket-related styling utilities for consistent UI appearance
 */

import type {Ticket} from "../types/ticket";
import {Priority} from "@/enums/Priority.ts";
import {TicketStatus} from "@/enums/TicketStatus.ts";

/**
 * Get Tailwind CSS classes for priority badges
 * @param priority - Ticket priority level
 * @returns CSS class string for priority styling
 */
export const getPriorityColorClasses = (priority: Priority): string => {
    switch (priority) {
        case Priority.Critical:
            return "bg-red-500 text-white hover:bg-red-600";
        case Priority.High:
            return "bg-orange-500 text-white hover:bg-orange-600";
        case Priority.Medium:
            return "bg-yellow-500 text-black hover:bg-yellow-600";
        case Priority.Low:
            return "bg-green-500 text-white hover:bg-green-600";
        default:
            return "bg-gray-500 text-white hover:bg-gray-600";
    }
};

/**
 * Get Tailwind CSS classes for status badges
 * @param status - Ticket status
 * @returns CSS class string for status styling
 */
export const getStatusColorClasses = (status: TicketStatus): string => {
    switch (status) {
        case TicketStatus.Open:
            return "bg-blue-500 text-white hover:bg-blue-600";
        case TicketStatus.InProgress:
            return "bg-orange-500 text-white hover:bg-orange-600";
        case TicketStatus.Resolved:
            return "bg-green-500 text-white hover:bg-green-600";
        default:
            return "bg-gray-500 text-white hover:bg-gray-600";
    }
};

/**
 * Get Badge variant for priority (for shadcn/ui Badge component)
 * @param priority - Ticket priority level
 * @returns Badge variant string
 */
export const getPriorityVariant = (priority: Priority): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
        case Priority.Critical:
            return 'destructive';
        case Priority.High:
            return 'destructive';
        case Priority.Medium:
            return 'default';
        case Priority.Low:
            return 'secondary';
        default:
            return 'default';
    }
};

/**
 * Get Badge variant for status (for shadcn/ui Badge component)
 * @param status - Ticket status
 * @returns Badge variant string
 */
export const getStatusVariant = (status: TicketStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case TicketStatus.Open:
            return 'destructive';
        case TicketStatus.InProgress:
            return 'default';
        case TicketStatus.Resolved:
            return 'secondary';
        default:
            return 'default';
    }
};

/**
 * Get the assigned agent display name
 * @param ticket - Ticket object
 * @returns Agent name or fallback text
 */
export const getAssignedAgentName = (ticket: Ticket): string => {
    return ticket.assignedAgent || ticket.assignedAgentId || "Unassigned";
};

/**
 * Get ticket statistics from an array of tickets
 * @param tickets - Array of tickets
 * @returns Object containing ticket counts by status and priority
 */
export const getTicketStats = (tickets: Ticket[]) => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === TicketStatus.Open).length;
    const inProgress = tickets.filter(t => t.status === TicketStatus.InProgress).length;
    const resolved = tickets.filter(t => t.status === TicketStatus.Resolved).length;

    const critical = tickets.filter(t => t.priority === Priority.Critical).length;
    const high = tickets.filter(t => t.priority === Priority.High).length;
    const medium = tickets.filter(t => t.priority === Priority.Medium).length;
    const low = tickets.filter(t => t.priority === Priority.Low).length;

    return {
        total,
        byStatus: {open, inProgress, resolved},
        byPriority: {critical, high, medium, low}
    };
};

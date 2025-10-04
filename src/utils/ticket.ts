/**
 * Ticket-related styling utilities for consistent UI appearance
 */

import type {Ticket} from "../types/ticket";

/**
 * Get Tailwind CSS classes for priority badges
 * @param priority - Ticket priority level
 * @returns CSS class string for priority styling
 */
export const getPriorityColorClasses = (priority: string): string => {
    switch (priority) {
        case "Critical":
            return "bg-red-500 text-white hover:bg-red-600";
        case "High":
            return "bg-orange-500 text-white hover:bg-orange-600";
        case "Medium":
            return "bg-yellow-500 text-black hover:bg-yellow-600";
        case "Low":
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
export const getStatusColorClasses = (status: string): string => {
    switch (status) {
        case "Open":
            return "bg-blue-500 text-white hover:bg-blue-600";
        case "InProgress":
            return "bg-orange-500 text-white hover:bg-orange-600";
        case "Resolved":
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
export const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
        case 'Critical':
            return 'destructive';
        case 'High':
            return 'destructive';
        case 'Medium':
            return 'default';
        case 'Low':
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
export const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Open':
            return 'destructive';
        case 'InProgress':
            return 'default';
        case 'Resolved':
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
    const open = tickets.filter(t => t.status === "Open").length;
    const inProgress = tickets.filter(t => t.status === "InProgress").length;
    const resolved = tickets.filter(t => t.status === "Resolved").length;
    const critical = tickets.filter(t => t.priority === "Critical").length;
    const high = tickets.filter(t => t.priority === "High").length;
    const medium = tickets.filter(t => t.priority === "Medium").length;
    const low = tickets.filter(t => t.priority === "Low").length;

    return {
        total,
        byStatus: {open, inProgress, resolved},
        byPriority: {critical, high, medium, low}
    };
};

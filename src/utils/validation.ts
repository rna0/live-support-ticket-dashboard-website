/**
 * Validation utilities for form inputs and data
 */


import {TicketStatus} from "@/enums/TicketStatus.ts";
import {Priority} from "@/enums/Priority.ts";

/**
 * Validate ticket title
 * @param title - Ticket title to validate
 * @returns Validation result with isValid and error message
 */
export const validateTicketTitle = (title: string): { isValid: boolean; error?: string } => {
    if (!title || title.trim().length === 0) {
        return {isValid: false, error: "Title is required"};
    }
    if (title.length < 3) {
        return {isValid: false, error: "Title must be at least 3 characters long"};
    }
    if (title.length > 200) {
        return {isValid: false, error: "Title must be less than 200 characters"};
    }
    return {isValid: true};
};

/**
 * Validate ticket description
 * @param description - Ticket description to validate
 * @returns Validation result with isValid and error message
 */
export const validateTicketDescription = (description?: string): { isValid: boolean; error?: string } => {
    if (description && description.length > 2000) {
        return {isValid: false, error: "Description must be less than 2000 characters"};
    }
    return {isValid: true};
};

/**
 * Validate email address
 * @param email - Email to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate agent name
 * @param name - Agent name to validate
 * @returns Validation result with isValid and error message
 */
export const validateAgentName = (name: string): { isValid: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
        return {isValid: false, error: "Agent name is required"};
    }
    if (name.length < 2) {
        return {isValid: false, error: "Agent name must be at least 2 characters long"};
    }
    if (name.length > 100) {
        return {isValid: false, error: "Agent name must be less than 100 characters"};
    }
    return {isValid: true};
};

/**
 * Check if a ticket status transition is valid
 * @param currentStatus - Current ticket status
 * @param newStatus - New ticket status
 * @returns Boolean indicating if transition is valid
 */
export const isValidStatusTransition = (
    currentStatus: TicketStatus,
    newStatus: TicketStatus
): boolean => {
    // Define valid transitions
    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
        [TicketStatus.Open]: [TicketStatus.InProgress, TicketStatus.Resolved],
        [TicketStatus.InProgress]: [TicketStatus.Open, TicketStatus.Resolved],
        [TicketStatus.Resolved]: [TicketStatus.Open, TicketStatus.InProgress] // Allow reopening resolved tickets
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
};

/**
 * Validate priority level
 * @param priority - Priority to validate
 * @returns Boolean indicating if priority is valid
 */
export const isValidPriority = (priority: number): priority is Priority => {
    return Object.values(Priority).includes(priority as Priority);
};

/**
 * Validate status
 * @param status - Status to validate
 * @returns Boolean indicating if status is valid
 */
export const isValidStatus = (status: number): status is TicketStatus => {
    return Object.values(TicketStatus).includes(status as TicketStatus);
};

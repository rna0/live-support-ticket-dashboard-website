/**
 * Centralized exports for all utility functions
 */

// Date utilities
export {
    formatDateFull,
    formatDateCompact,
    formatRelativeTime
} from './date';

// Ticket utilities
export {
    getPriorityColorClasses,
    getStatusColorClasses,
    getPriorityVariant,
    getStatusVariant,
    getAssignedAgentName,
    getTicketStats
} from './ticket';

// Connection utilities
export {
    isValidUrl,
    createConnectionStatus,
    getConnectionMessage,
    retryWithBackoff
} from './connection';

// Validation utilities
export {
    validateTicketTitle,
    validateTicketDescription,
    isValidEmail,
    validateAgentName,
    isValidStatusTransition,
    isValidPriority,
    isValidStatus
} from './validation';

// Re-export UI utilities from lib
export {cn} from '../lib/utils';

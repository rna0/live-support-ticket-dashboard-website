import {useCallback, useState} from 'react';
import communicationService from '../services/communication';
import type {
    AssignTicketRequest,
    CreateTicketRequest,
    PaginatedResponse,
    Ticket,
    TicketFilters,
    UpdateTicketStatusRequest,
} from '../types/ticket';
import type {HealthCheckResponse} from '../types/health';
import type {AgentsPagedResponse, AgentStatusResponse, GetAgentsParams} from '../types/auth';
import type {
    Attachment,
    CreateSessionRequest,
    Message,
    MessagesResponse,
    SendMessageRequest,
    Session
} from '../types/session';

export interface ApiMethodsHook {
    error: string | null;
    setError: (error: string | null) => void;

    // Agent methods
    getAllAgents: (params?: GetAgentsParams) => Promise<AgentsPagedResponse>;
    getAgentStatus: (agentId: string) => Promise<AgentStatusResponse>;
    getHealthStatus: () => Promise<HealthCheckResponse>;

    // Ticket methods
    getTickets: (filters?: TicketFilters) => Promise<PaginatedResponse<Ticket>>;
    getTicket: (id: string) => Promise<Ticket>;
    createTicket: (ticket: CreateTicketRequest) => Promise<{ id: string; location: string }>;

    updateTicketStatus: (id: string, status: UpdateTicketStatusRequest) => Promise<void>;
    assignTicket: (ticketId: string, assignment?: AssignTicketRequest) => Promise<void>;
    deleteTicket: (ticketId: string) => Promise<void>;

    // Session methods
    createSession: (data: CreateSessionRequest) => Promise<Session>;
    getSession: (sessionId: string) => Promise<Session>;
    sendMessage: (sessionId: string, data: SendMessageRequest) => Promise<Message>;
    getMessages: (sessionId: string, afterMessageId?: string, limit?: number) => Promise<MessagesResponse>;

    // SignalR methods
    joinRoom: (sessionId: string) => Promise<void>;
    leaveRoom: (sessionId: string) => Promise<void>;
    sendMessageViaSignalR: (sessionId: string, text: string, attachments?: Attachment[]) => Promise<void>;
    ping: () => Promise<void>;
}

export const useApiMethods = (): ApiMethodsHook => {
    const [error, setError] = useState<string | null>(null);

    const getAllAgents = useCallback(async (params?: GetAgentsParams) => {
        try {
            setError(null);
            return await communicationService.getAllAgents(params);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get agents');
            throw err;
        }
    }, []);

    const getAgentStatus = useCallback(async (agentId: string) => {
        try {
            setError(null);
            return await communicationService.getAgentStatus(agentId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get agent status');
            throw err;
        }
    }, []);

    const getTickets = useCallback(async (filters?: TicketFilters) => {
        try {
            setError(null);
            return await communicationService.getTickets(filters);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get tickets');
            throw err;
        }
    }, []);

    const getTicket = useCallback(async (id: string) => {
        try {
            setError(null);
            return await communicationService.getTicket(id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get ticket');
            throw err;
        }
    }, []);

    const createTicket = useCallback(async (ticket: CreateTicketRequest) => {
        try {
            setError(null);
            return await communicationService.createTicket(ticket);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create ticket');
            throw err;
        }
    }, []);

    const updateTicketStatus = useCallback(async (id: string, status: UpdateTicketStatusRequest) => {
        try {
            setError(null);
            return await communicationService.updateTicketStatus(id, status);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update ticket status');
            throw err;
        }
    }, []);

    const assignTicket = useCallback(async (ticketId: string, assignment?: AssignTicketRequest) => {
        try {
            setError(null);
            return await communicationService.assignTicket(ticketId, assignment);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign ticket');
            throw err;
        }
    }, []);

    const deleteTicket = useCallback(async (ticketId: string) => {
        try {
            setError(null);
            return await communicationService.deleteTicket(ticketId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete ticket');
            throw err;
        }
    }, []);

    const getHealthStatus = useCallback(async () => {
        try {
            setError(null);
            return await communicationService.getHealthStatus();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get health status');
            throw err;
        }
    }, []);

    const createSession = useCallback(async (data: CreateSessionRequest) => {
        try {
            setError(null);
            return await communicationService.createSession(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create session');
            throw err;
        }
    }, []);

    const getSession = useCallback(async (sessionId: string) => {
        try {
            setError(null);
            return await communicationService.getSession(sessionId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get session');
            throw err;
        }
    }, []);

    const sendMessage = useCallback(async (sessionId: string, data: SendMessageRequest) => {
        try {
            setError(null);
            return await communicationService.sendMessage(sessionId, data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message');
            throw err;
        }
    }, []);

    const getMessages = useCallback(async (sessionId: string, afterMessageId?: string, limit?: number) => {
        try {
            setError(null);
            return await communicationService.getMessages(sessionId, afterMessageId, limit);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get messages');
            throw err;
        }
    }, []);

    const joinRoom = useCallback(async (sessionId: string) => {
        try {
            setError(null);
            return await communicationService.joinRoom(sessionId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to join room');
            throw err;
        }
    }, []);

    const leaveRoom = useCallback(async (sessionId: string) => {
        try {
            setError(null);
            return await communicationService.leaveRoom(sessionId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to leave room');
            throw err;
        }
    }, []);

    const sendMessageViaSignalR = useCallback(async (sessionId: string, text: string, attachments?: Attachment[]) => {
        try {
            setError(null);
            return await communicationService.sendMessageViaSignalR(sessionId, text, attachments);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message via SignalR');
            throw err;
        }
    }, []);

    const ping = useCallback(async () => {
        try {
            setError(null);
            return await communicationService.ping();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to ping');
            throw err;
        }
    }, []);

    return {
        error,
        setError,
        getAllAgents,
        getAgentStatus,
        getHealthStatus,
        getTickets,
        getTicket,
        createTicket,
        updateTicketStatus,
        assignTicket,
        deleteTicket,
        createSession,
        getSession,
        sendMessage,
        getMessages,
        joinRoom,
        leaveRoom,
        sendMessageViaSignalR,
        ping,
    };
};

import {useCallback, useEffect, useRef, useState} from 'react';
import communicationService from '../services/communication';
import type {
    AgentConnectedPayload,
    AgentDisconnectedPayload,
    AssignTicketRequest,
    CreateTicketRequest,
    PaginatedResponse,
    Ticket,
    TicketAssignedPayload,
    TicketFilters,
    TicketStatusChangedPayload,
    UpdateTicketStatusRequest,
} from '../types/ticket';
import type {HealthCheckResponse} from '../types/health';
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    Agent,
    AgentStatus
} from '../types/auth';
import type {
    CreateSessionRequest,
    Session,
    SendMessageRequest,
    Message,
    MessagesResponse,
    ReceiveMessagePayload,
    AgentTypingPayload,
    AgentJoinedPayload,
    AgentLeftPayload,
    UpdateQueuePayload
} from '../types/session';

export interface UseCommunicationServiceOptions {
    autoConnect?: boolean;
}

export interface UseCommunicationServiceReturn {
    // Connection state
    isConnected: boolean;
    isSignalRConnected: boolean;
    isInitialized: boolean;
    error: string | null;
    currentAgentId: string | null;

    // Authentication methods
    register: (data: RegisterRequest) => Promise<AuthResponse>;
    login: (data: LoginRequest) => Promise<AuthResponse>;
    logout: () => Promise<void>;

    // Agent methods
    getAllAgents: () => Promise<Agent[]>;
    getAgentStatus: (agentId: string) => Promise<AgentStatus>;

    // API methods
    getTickets: (filters?: TicketFilters) => Promise<PaginatedResponse<Ticket>>;
    getTicket: (id: string) => Promise<Ticket>;
    createTicket: (ticket: CreateTicketRequest) => Promise<{ id: string; location: string }>;

    updateTicketStatus: (id: string, status: UpdateTicketStatusRequest) => Promise<void>;
    assignTicket: (ticketId: string, assignment?: AssignTicketRequest) => Promise<void>;
    getHealthStatus: () => Promise<HealthCheckResponse>;

    // Session methods
    createSession: (data: CreateSessionRequest) => Promise<Session>;
    getSession: (sessionId: string) => Promise<Session>;
    sendMessage: (sessionId: string, data: SendMessageRequest) => Promise<Message>;
    getMessages: (sessionId: string, afterMessageId?: string, limit?: number) => Promise<MessagesResponse>;

    // SignalR methods
    joinRoom: (sessionId: string) => Promise<void>;
    leaveRoom: (sessionId: string) => Promise<void>;
    sendMessageViaSignalR: (sessionId: string, text: string, attachments?: any[]) => Promise<void>;
    ping: () => Promise<void>;

    // Connection management
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;

    // Event handlers
    onTicketCreated: (handler: (ticket: Ticket) => void) => void;
    onTicketUpdated: (handler: (ticket: Ticket) => void) => void;
    onTicketStatusChanged: (handler: (payload: TicketStatusChangedPayload) => void) => void;
    onTicketAssigned: (handler: (payload: TicketAssignedPayload) => void) => void;
    onAgentConnected: (handler: (payload: AgentConnectedPayload) => void) => void;
    onAgentDisconnected: (handler: (payload: AgentDisconnectedPayload) => void) => void;
    onReceiveMessage: (handler: (payload: ReceiveMessagePayload) => void) => void;
    onAgentTyping: (handler: (payload: AgentTypingPayload) => void) => void;
    onAgentJoined: (handler: (payload: AgentJoinedPayload) => void) => void;
    onAgentLeft: (handler: (payload: AgentLeftPayload) => void) => void;
    onUpdateQueue: (handler: (payload: UpdateQueuePayload) => void) => void;
}

export const useCommunicationService = (options: UseCommunicationServiceOptions = {}): UseCommunicationServiceReturn => {
    const {autoConnect = false} = options; // Changed default to false - require authentication first

    const [isConnected, setIsConnected] = useState(false);
    const [isSignalRConnected, setIsSignalRConnected] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);

    const eventHandlersRef = useRef<{
        onTicketCreated?: (ticket: Ticket) => void;
        onTicketUpdated?: (ticket: Ticket) => void;
        onTicketStatusChanged?: (payload: TicketStatusChangedPayload) => void;
        onTicketAssigned?: (payload: TicketAssignedPayload) => void;
        onAgentConnected?: (payload: AgentConnectedPayload) => void;
        onAgentDisconnected?: (payload: AgentDisconnectedPayload) => void;
        onReceiveMessage?: (payload: ReceiveMessagePayload) => void;
        onAgentTyping?: (payload: AgentTypingPayload) => void;
        onAgentJoined?: (payload: AgentJoinedPayload) => void;
        onAgentLeft?: (payload: AgentLeftPayload) => void;
        onUpdateQueue?: (payload: UpdateQueuePayload) => void;
    }>({});

    // Authentication methods
    const register = useCallback(async (data: RegisterRequest) => {
        try {
            setError(null);
            const response = await communicationService.register(data);
            setCurrentAgentId(response.id);
            setIsConnected(true);
            setIsInitialized(true);
            setIsSignalRConnected(communicationService.isSignalRConnected());

            // Set up event handlers after initialization
            communicationService.setEventHandlers(eventHandlersRef.current);

            return response;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
            throw err;
        }
    }, []);

    const login = useCallback(async (data: LoginRequest) => {
        try {
            setError(null);
            const response = await communicationService.login(data);
            setCurrentAgentId(response.id);
            setIsConnected(true);
            setIsInitialized(true);
            setIsSignalRConnected(communicationService.isSignalRConnected());

            // Set up event handlers after initialization
            communicationService.setEventHandlers(eventHandlersRef.current);

            return response;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            throw err;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            setError(null);
            await communicationService.logout();
            setCurrentAgentId(null);
            setIsConnected(false);
            setIsInitialized(false);
            setIsSignalRConnected(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Logout failed');
            throw err;
        }
    }, []);

    // Initialize connection (without auth - requires login/register first)
    const connect = useCallback(async () => {
        try {
            setError(null);
            await communicationService.initialize();
            setIsConnected(true);
            setIsInitialized(true);
            setIsSignalRConnected(communicationService.isSignalRConnected());
            setCurrentAgentId(communicationService.getCurrentAgentId());

            // Set up event handlers
            communicationService.setEventHandlers(eventHandlersRef.current);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Connection failed');
            setIsConnected(false);
            setIsInitialized(false);
            setIsSignalRConnected(false);
        }
    }, []);

    // Disconnect
    const disconnect = useCallback(async () => {
        try {
            await communicationService.disconnect();
            setIsConnected(false);
            setIsInitialized(false);
            setIsSignalRConnected(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Disconnect failed');
        }
    }, []);

    // Auto-connect on mount (only if enabled - typically not used with auth)
    useEffect(() => {
        if (autoConnect) {
            connect();
        }
    }, [autoConnect, connect]);

    // Periodically check SignalR connection status
    useEffect(() => {
        const interval = setInterval(() => {
            setIsSignalRConnected(communicationService.isSignalRConnected());
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Agent methods
    const getAllAgents = useCallback(async () => {
        try {
            setError(null);
            return await communicationService.getAllAgents();
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

    // API methods with error handling
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

    const getHealthStatus = useCallback(async () => {
        try {
            setError(null);
            return await communicationService.getHealthStatus();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get health status');
            throw err;
        }
    }, []);

    // Session methods
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

    // SignalR methods
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

    const sendMessageViaSignalR = useCallback(async (sessionId: string, text: string, attachments?: any[]) => {
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

    // Event handler setters
    const onTicketCreated = useCallback((handler: (ticket: Ticket) => void) => {
        eventHandlersRef.current.onTicketCreated = handler;
        communicationService.updateEventHandler('onTicketCreated', handler);
    }, []);

    const onTicketUpdated = useCallback((handler: (ticket: Ticket) => void) => {
        eventHandlersRef.current.onTicketUpdated = handler;
        communicationService.updateEventHandler('onTicketUpdated', handler);
    }, []);

    const onTicketStatusChanged = useCallback((handler: (payload: TicketStatusChangedPayload) => void) => {
        eventHandlersRef.current.onTicketStatusChanged = handler;
        communicationService.updateEventHandler('onTicketStatusChanged', handler);
    }, []);

    const onTicketAssigned = useCallback((handler: (payload: TicketAssignedPayload) => void) => {
        eventHandlersRef.current.onTicketAssigned = handler;
        communicationService.updateEventHandler('onTicketAssigned', handler);
    }, []);

    const onAgentConnected = useCallback((handler: (payload: AgentConnectedPayload) => void) => {
        eventHandlersRef.current.onAgentConnected = handler;
        communicationService.updateEventHandler('onAgentConnected', handler);
    }, []);

    const onAgentDisconnected = useCallback((handler: (payload: AgentDisconnectedPayload) => void) => {
        eventHandlersRef.current.onAgentDisconnected = handler;
        communicationService.updateEventHandler('onAgentDisconnected', handler);
    }, []);

    // New messaging event handlers
    const onReceiveMessage = useCallback((handler: (payload: ReceiveMessagePayload) => void) => {
        eventHandlersRef.current.onReceiveMessage = handler;
        communicationService.updateEventHandler('onReceiveMessage', handler);
    }, []);

    const onAgentTyping = useCallback((handler: (payload: AgentTypingPayload) => void) => {
        eventHandlersRef.current.onAgentTyping = handler;
        communicationService.updateEventHandler('onAgentTyping', handler);
    }, []);

    const onAgentJoined = useCallback((handler: (payload: AgentJoinedPayload) => void) => {
        eventHandlersRef.current.onAgentJoined = handler;
        communicationService.updateEventHandler('onAgentJoined', handler);
    }, []);

    const onAgentLeft = useCallback((handler: (payload: AgentLeftPayload) => void) => {
        eventHandlersRef.current.onAgentLeft = handler;
        communicationService.updateEventHandler('onAgentLeft', handler);
    }, []);

    const onUpdateQueue = useCallback((handler: (payload: UpdateQueuePayload) => void) => {
        eventHandlersRef.current.onUpdateQueue = handler;
        communicationService.updateEventHandler('onUpdateQueue', handler);
    }, []);

    return {
        // State
        isConnected,
        isSignalRConnected,
        isInitialized,
        error,
        currentAgentId,

        // Authentication
        register,
        login,
        logout,

        // Agent methods
        getAllAgents,
        getAgentStatus,

        // API methods
        getTickets,
        getTicket,
        createTicket,
        updateTicketStatus,
        assignTicket,
        getHealthStatus,

        // Session methods
        createSession,
        getSession,
        sendMessage,
        getMessages,

        // SignalR methods
        joinRoom,
        leaveRoom,
        sendMessageViaSignalR,
        ping,

        // Connection management
        connect,
        disconnect,

        // Event handlers
        onTicketCreated,
        onTicketUpdated,
        onTicketStatusChanged,
        onTicketAssigned,
        onAgentConnected,
        onAgentDisconnected,
        onReceiveMessage,
        onAgentTyping,
        onAgentJoined,
        onAgentLeft,
        onUpdateQueue,
    };
};

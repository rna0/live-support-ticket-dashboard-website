import {useCallback, useEffect, useRef, useState} from 'react';
import communicationService from '../services/communication';
import type {
    AgentsPagedResponse,
    AgentStatusResponse,
    AuthResponse,
    GetAgentsParams,
    LoginRequest,
    RegisterRequest
} from '../types/auth';
import type {HealthCheckResponse} from '../types/health';
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
import type {
    AgentJoinedPayload,
    AgentLeftPayload,
    AgentTypingPayload,
    Attachment,
    CreateSessionRequest,
    Message,
    MessagesResponse,
    ReceiveMessagePayload,
    SendMessageRequest,
    Session,
    UpdateQueuePayload
} from '../types/session';
import {useApiMethods} from './useCommunicationService.api';
import {useEventHandlers} from './useCommunicationService.events';

export interface UseCommunicationServiceOptions {
    autoConnect?: boolean;
}

export interface UseCommunicationServiceReturn {
    isConnected: boolean;
    isSignalRConnected: boolean;
    isInitialized: boolean;
    error: string | null;
    currentAgentId: string | null;
    currentAgentName: string | null;
    currentAgentEmail: string | null;
    register: (data: RegisterRequest) => Promise<AuthResponse>;
    login: (data: LoginRequest) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    setError: (error: string | null) => void;
    getAllAgents: (params?: GetAgentsParams) => Promise<AgentsPagedResponse>;
    getAgentStatus: (agentId: string) => Promise<AgentStatusResponse>;
    getHealthStatus: () => Promise<HealthCheckResponse>;
    getTickets: (filters?: TicketFilters) => Promise<PaginatedResponse<Ticket>>;
    getTicket: (id: string) => Promise<Ticket>;
    createTicket: (ticket: CreateTicketRequest) => Promise<{ id: string; location: string }>;
    updateTicketStatus: (id: string, status: UpdateTicketStatusRequest) => Promise<void>;
    assignTicket: (ticketId: string, assignment?: AssignTicketRequest) => Promise<void>;
    deleteTicket: (ticketId: string) => Promise<void>;
    createSession: (data: CreateSessionRequest) => Promise<Session>;
    getSession: (sessionId: string) => Promise<Session>;
    sendMessage: (sessionId: string, data: SendMessageRequest) => Promise<Message>;
    getMessages: (sessionId: string, afterMessageId?: string, limit?: number) => Promise<MessagesResponse>;
    joinRoom: (sessionId: string) => Promise<void>;
    leaveRoom: (sessionId: string) => Promise<void>;
    sendMessageViaSignalR: (sessionId: string, text: string, attachments?: Attachment[]) => Promise<void>;
    ping: () => Promise<void>;
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
    const {autoConnect = false} = options;

    const [isConnected, setIsConnected] = useState(false);
    const [isSignalRConnected, setIsSignalRConnected] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
    const [currentAgentName, setCurrentAgentName] = useState<string | null>(null);
    const [currentAgentEmail, setCurrentAgentEmail] = useState<string | null>(null);

    const hasAttemptedRestore = useRef(false);

    const apiMethods = useApiMethods();
    const eventHandlers = useEventHandlers();

    const handlePostAuthInitialization = useCallback(async (response: AuthResponse) => {
        setCurrentAgentId(response.id);
        setCurrentAgentName(response.name);
        setCurrentAgentEmail(response.email);

        const signalRReady = await communicationService.waitForSignalR(3000);

        setIsConnected(true);
        setIsInitialized(true);
        setIsSignalRConnected(signalRReady);

        communicationService.setEventHandlers(eventHandlers.eventHandlersRef.current);

        return response;
    }, [eventHandlers.eventHandlersRef]);

    const register = useCallback(async (data: RegisterRequest) => {
        try {
            setError(null);
            const response = await communicationService.register(data);
            return await handlePostAuthInitialization(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
            throw err;
        }
    }, [handlePostAuthInitialization]);

    const login = useCallback(async (data: LoginRequest) => {
        try {
            setError(null);
            const response = await communicationService.login(data);
            return await handlePostAuthInitialization(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            throw err;
        }
    }, [handlePostAuthInitialization]);

    const logout = useCallback(async () => {
        try {
            setError(null);
            await communicationService.logout();
            setCurrentAgentId(null);
            setCurrentAgentName(null);
            setCurrentAgentEmail(null);
            setIsConnected(false);
            setIsInitialized(false);
            setIsSignalRConnected(false);
            hasAttemptedRestore.current = false;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Logout failed');
            throw err;
        }
    }, []);

    const connect = useCallback(async () => {
        try {
            setError(null);

            // Get the current agent info before initialization
            const agentId = communicationService.getCurrentAgentId();
            const agentName = communicationService.getCurrentAgentName();
            const agentEmail = communicationService.getCurrentAgentEmail();

            console.log('[useCommunicationService] Connecting with agent:', agentId);

            await communicationService.initialize();

            // Update state after successful initialization
            setIsConnected(true);
            setIsInitialized(true);
            setIsSignalRConnected(communicationService.isSignalRConnected());

            // Re-get agent info in case it changed during initialization
            setCurrentAgentId(communicationService.getCurrentAgentId() || agentId);
            setCurrentAgentName(communicationService.getCurrentAgentName() || agentName);
            setCurrentAgentEmail(communicationService.getCurrentAgentEmail() || agentEmail);

            communicationService.setEventHandlers(eventHandlers.eventHandlersRef.current);
        } catch (err) {
            console.error('[useCommunicationService] Connection failed:', err);
            setError(err instanceof Error ? err.message : 'Connection failed');

            // Don't clear the agent ID on connection failure - user might still be logged in
            // Only mark as not initialized
            setIsConnected(false);
            setIsInitialized(false);
            setIsSignalRConnected(false);
        }
    }, [eventHandlers.eventHandlersRef]);

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

    useEffect(() => {
        if (hasAttemptedRestore.current) {
            return;
        }

        hasAttemptedRestore.current = true;

        const agentInfo = communicationService.restoreSession();
        if (agentInfo.id) {
            setCurrentAgentId(agentInfo.id);
            setCurrentAgentName(agentInfo.name);
            setCurrentAgentEmail(agentInfo.email);
            connect().catch(err => {
                console.error('[useCommunicationService] Failed to connect after session restore:', err);
            });
        }
    }, [connect]);

    useEffect(() => {
        if (autoConnect && !hasAttemptedRestore.current) {
            connect();
        }
    }, [autoConnect, connect]);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsSignalRConnected(communicationService.isSignalRConnected());
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return {
        isConnected,
        isSignalRConnected,
        isInitialized,
        error: error || apiMethods.error,
        currentAgentId,
        currentAgentName,
        currentAgentEmail,
        register,
        login,
        logout,
        connect,
        disconnect,
        getAllAgents: apiMethods.getAllAgents,
        getAgentStatus: apiMethods.getAgentStatus,
        getHealthStatus: apiMethods.getHealthStatus,
        getTickets: apiMethods.getTickets,
        getTicket: apiMethods.getTicket,
        createTicket: apiMethods.createTicket,
        updateTicketStatus: apiMethods.updateTicketStatus,
        assignTicket: apiMethods.assignTicket,
        deleteTicket: apiMethods.deleteTicket,
        createSession: apiMethods.createSession,
        getSession: apiMethods.getSession,
        sendMessage: apiMethods.sendMessage,
        getMessages: apiMethods.getMessages,
        joinRoom: apiMethods.joinRoom,
        leaveRoom: apiMethods.leaveRoom,
        sendMessageViaSignalR: apiMethods.sendMessageViaSignalR,
        ping: apiMethods.ping,
        setError: apiMethods.setError,
        onTicketCreated: eventHandlers.onTicketCreated,
        onTicketUpdated: eventHandlers.onTicketUpdated,
        onTicketStatusChanged: eventHandlers.onTicketStatusChanged,
        onTicketAssigned: eventHandlers.onTicketAssigned,
        onAgentConnected: eventHandlers.onAgentConnected,
        onAgentDisconnected: eventHandlers.onAgentDisconnected,
        onReceiveMessage: eventHandlers.onReceiveMessage,
        onAgentTyping: eventHandlers.onAgentTyping,
        onAgentJoined: eventHandlers.onAgentJoined,
        onAgentLeft: eventHandlers.onAgentLeft,
        onUpdateQueue: eventHandlers.onUpdateQueue,
    };
};

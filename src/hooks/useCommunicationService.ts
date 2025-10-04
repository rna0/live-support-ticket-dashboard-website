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

export interface UseCommunicationServiceOptions {
    autoConnect?: boolean;
}

export interface UseCommunicationServiceReturn {
    // Connection state
    isConnected: boolean;
    isSignalRConnected: boolean;
    isInitialized: boolean;
    error: string | null;

    // API methods
    getTickets: (filters?: TicketFilters) => Promise<PaginatedResponse<Ticket>>;
    getTicket: (id: string) => Promise<Ticket>;
    createTicket: (ticket: CreateTicketRequest) => Promise<{ id: string; location: string }>;
    updateTicketStatus: (id: string, status: UpdateTicketStatusRequest) => Promise<void>;
    assignTicket: (id: string, assignment: AssignTicketRequest) => Promise<void>;
    getHealthStatus: () => Promise<HealthCheckResponse>;

    // Connection management
    connect: (baseURL?: string) => Promise<void>;
    disconnect: () => Promise<void>;

    // Event handlers
    onTicketCreated: (handler: (ticket: Ticket) => void) => void;
    onTicketUpdated: (handler: (ticket: Ticket) => void) => void;
    onTicketStatusChanged: (handler: (payload: TicketStatusChangedPayload) => void) => void;
    onTicketAssigned: (handler: (payload: TicketAssignedPayload) => void) => void;
    onAgentConnected: (handler: (payload: AgentConnectedPayload) => void) => void;
    onAgentDisconnected: (handler: (payload: AgentDisconnectedPayload) => void) => void;
}

export const useCommunicationService = (options: UseCommunicationServiceOptions = {}): UseCommunicationServiceReturn => {
    const {autoConnect = true} = options;

    const [isConnected, setIsConnected] = useState(false);
    const [isSignalRConnected, setIsSignalRConnected] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const eventHandlersRef = useRef<{
        onTicketCreated?: (ticket: Ticket) => void;
        onTicketUpdated?: (ticket: Ticket) => void;
        onTicketStatusChanged?: (payload: TicketStatusChangedPayload) => void;
        onTicketAssigned?: (payload: TicketAssignedPayload) => void;
        onAgentConnected?: (payload: AgentConnectedPayload) => void;
        onAgentDisconnected?: (payload: AgentDisconnectedPayload) => void;
    }>({});

    // Initialize connection
    const connect = useCallback(async () => {
        try {
            setError(null);
            await communicationService.initialize();
            setIsConnected(true);
            setIsInitialized(true);
            setIsSignalRConnected(communicationService.isSignalRConnected());

            // Set up event handlers
            communicationService.setEventHandlers({
                onTicketCreated: eventHandlersRef.current.onTicketCreated,
                onTicketUpdated: eventHandlersRef.current.onTicketUpdated,
                onTicketStatusChanged: eventHandlersRef.current.onTicketStatusChanged,
                onTicketAssigned: eventHandlersRef.current.onTicketAssigned,
                onAgentConnected: eventHandlersRef.current.onAgentConnected,
                onAgentDisconnected: eventHandlersRef.current.onAgentDisconnected,
            });
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

    // Auto-connect on mount
    useEffect(() => {
        if (autoConnect) {
            connect();
        }
    }, [autoConnect, connect]);

    // Periodically check SignalR connection status using communicationService
    useEffect(() => {
        const interval = setInterval(() => {
            setIsSignalRConnected(communicationService.isSignalRConnected());
        }, 5000);

        return () => clearInterval(interval);
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

    const assignTicket = useCallback(async (id: string, assignment: AssignTicketRequest) => {
        try {
            setError(null);
            return await communicationService.assignTicket(id, assignment);
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

    return {
        // State
        isConnected,
        isSignalRConnected,
        isInitialized,
        error,

        // API methods
        getTickets,
        getTicket,
        createTicket,
        updateTicketStatus,
        assignTicket,
        getHealthStatus,

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
    };
};

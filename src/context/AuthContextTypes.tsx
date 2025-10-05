import {createContext} from 'react';
import type {AgentsPagedResponse, GetAgentsParams, LoginRequest, RegisterRequest} from '../types/auth';
import type {
    AssignTicketRequest,
    CreateTicketRequest,
    PaginatedResponse,
    Ticket,
    TicketFilters,
    TicketStatusChangedPayload,
    UpdateTicketStatusRequest
} from '../types/ticket';

export interface AuthContextType {
    isConnected: boolean;
    isInitialized: boolean;
    currentAgentId: string | null;
    currentAgentName: string | null;
    currentAgentEmail: string | null;
    error: string | null;
    isAuthenticating: boolean;

    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;

    getAllAgents: (params?: GetAgentsParams) => Promise<AgentsPagedResponse>;
    getTickets: (filters?: TicketFilters) => Promise<PaginatedResponse<Ticket>>;
    getTicket: (id: string) => Promise<Ticket>;
    createTicket: (ticket: CreateTicketRequest) => Promise<{ id: string; location: string }>;

    updateTicketStatus: (id: string, status: UpdateTicketStatusRequest) => Promise<void>;
    assignTicket: (ticketId: string, assignment?: AssignTicketRequest) => Promise<void>;
    deleteTicket: (ticketId: string) => Promise<void>;

    onTicketCreated: (handler: (ticket: Ticket) => void) => void;
    onTicketUpdated: (handler: (ticket: Ticket) => void) => void;
    onTicketStatusChanged: (handler: (payload: TicketStatusChangedPayload) => void) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

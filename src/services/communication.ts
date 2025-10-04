import {ApiService} from './api';
import {type SignalREventHandlers, SignalRService} from './signalr';
import type {
    AssignTicketRequest,
    CreateTicketRequest,
    PaginatedResponse,
    Ticket,
    TicketFilters,
    UpdateTicketStatusRequest,
} from '../types/ticket';
import type {HealthCheckResponse} from '../types/health';
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    Agent,
    AgentStatus,
    HeartbeatResponse,
    LogoutResponse
} from '../types/auth';
import type {
    CreateSessionRequest,
    Session,
    SendMessageRequest,
    Message,
    MessagesResponse
} from '../types/session';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const SIGNALR_BASE_URL = import.meta.env.VITE_SIGNALR_URL;

if (!API_BASE_URL) throw new Error('Missing VITE_API_URL in environment');
if (!SIGNALR_BASE_URL) throw new Error('Missing VITE_SIGNALR_URL in environment');

const apiService = new ApiService(API_BASE_URL);
const signalRService = new SignalRService(SIGNALR_BASE_URL);

// Set up token provider for SignalR
signalRService.setAccessTokenProvider(() => apiService.getToken());

class CommunicationService {
    private initialized = false;
    private currentAgentId: string | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private heartbeatIntervalMs = 45000; // 45 seconds (recommended 30-60s)

    constructor() {
        // Don't auto-initialize - wait for authentication
    }

    // Authentication methods
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await apiService.register(data);
        this.currentAgentId = response.id;
        await this.initialize();
        return response;
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiService.login(data);
        this.currentAgentId = response.id;
        await this.initialize();
        return response;
    }

    async logout(): Promise<void> {
        if (!this.currentAgentId) {
            throw new Error('No agent logged in');
        }

        await apiService.logout(this.currentAgentId);
        this.stopHeartbeat();
        await this.disconnect();
        this.currentAgentId = null;
    }

    getCurrentAgentId(): string | null {
        return this.currentAgentId;
    }

    getToken(): string | null {
        return apiService.getToken();
    }

    setToken(token: string | null, agentId?: string): void {
        apiService.setToken(token);
        if (agentId) {
            this.currentAgentId = agentId;
        }
    }

    async initialize(): Promise<void> {
        try {
            console.log('[CommunicationService] Initializing...');

            // Check health
            await apiService.getHealthStatus();
            console.log('[CommunicationService] API connection established');

            // Connect SignalR with token
            await signalRService.connect();
            console.log('[CommunicationService] SignalR connection established');

            // Start heartbeat if agent is logged in
            if (this.currentAgentId) {
                this.startHeartbeat();
            }

            this.initialized = true;
        } catch (error) {
            console.error('[CommunicationService] Initialization failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        this.stopHeartbeat();
        await signalRService.disconnect();
        this.initialized = false;
    }

    // Heartbeat management
    private startHeartbeat(): void {
        if (this.heartbeatInterval) {
            return; // Already running
        }

        console.log('[CommunicationService] Starting heartbeat');

        // Send initial heartbeat
        this.sendHeartbeat();

        // Set up interval
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, this.heartbeatIntervalMs);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            console.log('[CommunicationService] Stopping heartbeat');
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    private async sendHeartbeat(): Promise<void> {
        if (!this.currentAgentId) {
            return;
        }

        try {
            await apiService.updateHeartbeat(this.currentAgentId);
            console.log('[CommunicationService] Heartbeat sent');
        } catch (error) {
            console.error('[CommunicationService] Heartbeat failed:', error);
        }
    }

    // Agent methods
    async getAllAgents(): Promise<Agent[]> {
        await this.ensureInitialized();
        return apiService.getAllAgents();
    }

    async getAgentStatus(agentId: string): Promise<AgentStatus> {
        await this.ensureInitialized();
        return apiService.getAgentStatus(agentId);
    }

    async updateHeartbeat(agentId: string): Promise<HeartbeatResponse> {
        await this.ensureInitialized();
        return apiService.updateHeartbeat(agentId);
    }

    // Ticket methods
    async getTickets(filters?: TicketFilters): Promise<PaginatedResponse<Ticket>> {
        await this.ensureInitialized();
        return apiService.getAllTickets(filters);
    }

    async getTicket(id: string): Promise<Ticket> {
        await this.ensureInitialized();
        return apiService.getTicketById(id);
    }

    async createTicket(ticket: CreateTicketRequest): Promise<{ id: string; location: string }> {
        await this.ensureInitialized();
        if (!this.currentAgentId) {
            throw new Error('No agent logged in');
        }
        return apiService.createTicket(this.currentAgentId, ticket);
    }

    async updateTicketStatus(id: string, status: UpdateTicketStatusRequest): Promise<void> {
        await this.ensureInitialized();
        return apiService.updateTicketStatus(id, status);
    }

    async assignTicket(ticketId: string, assignment?: AssignTicketRequest): Promise<void> {
        await this.ensureInitialized();
        if (!this.currentAgentId) {
            throw new Error('No agent logged in');
        }
        return apiService.assignTicket(this.currentAgentId, ticketId, assignment);
    }

    // Session methods
    async createSession(data: CreateSessionRequest): Promise<Session> {
        await this.ensureInitialized();
        return apiService.createSession(data);
    }

    async getSession(sessionId: string): Promise<Session> {
        await this.ensureInitialized();
        return apiService.getSession(sessionId);
    }

    async sendMessage(sessionId: string, data: SendMessageRequest): Promise<Message> {
        await this.ensureInitialized();
        return apiService.sendMessage(sessionId, data);
    }

    async getMessages(sessionId: string, afterMessageId?: string, limit?: number): Promise<MessagesResponse> {
        await this.ensureInitialized();
        return apiService.getMessages(sessionId, afterMessageId, limit);
    }

    // SignalR methods
    async joinRoom(sessionId: string): Promise<void> {
        await this.ensureInitialized();
        return signalRService.joinRoom(sessionId);
    }

    async leaveRoom(sessionId: string): Promise<void> {
        await this.ensureInitialized();
        return signalRService.leaveRoom(sessionId);
    }

    async sendMessageViaSignalR(sessionId: string, text: string, attachments?: any[]): Promise<void> {
        await this.ensureInitialized();
        return signalRService.sendMessage(sessionId, text, attachments);
    }

    async ping(): Promise<void> {
        await this.ensureInitialized();
        return signalRService.ping();
    }

    setEventHandlers(handlers: SignalREventHandlers): void {
        signalRService.setEventHandlers(handlers);
    }

    updateEventHandler<K extends keyof SignalREventHandlers>(
        event: K,
        handler: SignalREventHandlers[K]
    ): void {
        signalRService.updateEventHandler(event, handler);
    }

    isSignalRConnected(): boolean {
        return signalRService.isConnected();
    }

    async getHealthStatus(): Promise<HealthCheckResponse> {
        return apiService.getHealthStatus();
    }

    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            throw new Error('CommunicationService not initialized. Please login or register first.');
        }
    }
}

const communicationService = new CommunicationService();
export default communicationService;
export {communicationService, API_BASE_URL, SIGNALR_BASE_URL};
export type {SignalREventHandlers};

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
    AgentsPagedResponse,
    AgentStatusResponse,
    AuthResponse,
    GetAgentsParams,
    LoginRequest,
    RegisterRequest
} from '../types/auth';
import type {
    Attachment,
    CreateSessionRequest,
    Message,
    MessagesResponse,
    SendMessageRequest,
    Session
} from '../types/session';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const SIGNALR_BASE_URL = import.meta.env.VITE_SIGNALR_URL;

if (!API_BASE_URL) throw new Error('Missing VITE_API_URL in environment');
if (!SIGNALR_BASE_URL) throw new Error('Missing VITE_SIGNALR_URL in environment');

const apiService = new ApiService(API_BASE_URL);
const signalRService = new SignalRService(SIGNALR_BASE_URL);

signalRService.setAccessTokenProvider(() => apiService.getToken());

class CommunicationService {
    private initialized = false;
    private initializing = false;
    private initializationPromise: Promise<void> | null = null;
    private currentAgentId: string | null = null;
    private currentAgentName: string | null = null;
    private currentAgentEmail: string | null = null;
    private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    private heartbeatIntervalMs = 45000;
    private signalRReadyPromise: Promise<void> | null = null;
    private signalRReadyResolve: (() => void) | null = null;

    restoreSession(): { id: string | null; name: string | null; email: string | null } {
        const agentInfo = apiService.getStoredAgentInfo();
        if (agentInfo.id && apiService.hasValidToken()) {
            this.currentAgentId = agentInfo.id;
            this.currentAgentName = agentInfo.name;
            this.currentAgentEmail = agentInfo.email;
            console.log('[CommunicationService] Session restored from storage. Agent ID:', this.currentAgentId);
        }
        return agentInfo;
    }

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await apiService.register(data);
        this.currentAgentId = response.id;
        this.currentAgentName = response.name;
        this.currentAgentEmail = response.email;
        this.initialize().catch(err => {
            console.error('[CommunicationService] Background initialization failed:', err);
        });
        return response;
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiService.login(data);
        this.currentAgentId = response.id;
        this.currentAgentName = response.name;
        this.currentAgentEmail = response.email;
        this.initialize().catch(err => {
            console.error('[CommunicationService] Background initialization failed:', err);
        });
        return response;
    }

    async logout(): Promise<void> {
        const agentId = this.currentAgentId || apiService.getStoredAgentInfo().id;

        try {
            if (agentId && agentId !== 'undefined' && agentId !== 'null') {
                await apiService.logout(agentId);
            } else {
                console.warn('[CommunicationService] No valid agent ID for logout, skipping API call');
            }
        } catch (error) {
            console.error('[CommunicationService] Logout API call failed:', error);
        }

        this.stopHeartbeat();
        await this.disconnect();
        this.currentAgentId = null;
        this.currentAgentName = null;
        this.currentAgentEmail = null;
    }

    getCurrentAgentId(): string | null {
        return this.currentAgentId;
    }

    getCurrentAgentName(): string | null {
        return this.currentAgentName;
    }

    getCurrentAgentEmail(): string | null {
        return this.currentAgentEmail;
    }

    async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('[CommunicationService] Already initialized');
            return;
        }

        if (this.initializing) {
            console.log('[CommunicationService] Initialization in progress, waiting...');
            return this.initializationPromise!;
        }

        this.initializing = true;

        this.signalRReadyPromise = new Promise<void>((resolve) => {
            this.signalRReadyResolve = resolve;
        });

        this.initializationPromise = this._doInitialize();

        try {
            await this.initializationPromise;
        } finally {
            this.initializing = false;
            this.initializationPromise = null;
        }
    }

    async waitForSignalR(timeoutMs: number = 10000): Promise<boolean> {
        if (this.isSignalRConnected()) {
            return true;
        }

        try {
            await Promise.race([
                this.signalRReadyPromise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('SignalR connection timeout')), timeoutMs)
                )
            ]);
            return this.isSignalRConnected();
        } catch {
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.stopHeartbeat();
        await signalRService.disconnect();
        this.initialized = false;
        this.initializing = false;
        this.initializationPromise = null;
        this.signalRReadyPromise = null;
        this.signalRReadyResolve = null;
    }

    async getAllAgents(params?: GetAgentsParams): Promise<AgentsPagedResponse> {
        await this.ensureInitialized();
        return apiService.getAllAgents(params);
    }

    async getAgentStatus(agentId: string): Promise<AgentStatusResponse> {
        await this.ensureInitialized();
        return apiService.getAgentStatus(agentId);
    }

    async getTickets(filters?: TicketFilters): Promise<PaginatedResponse<Ticket>> {
        await this.ensureInitialized();
        return apiService.getAllTickets(filters);
    }

    async getTicket(id: string): Promise<Ticket> {
        await this.ensureInitialized();
        return apiService.getTicketById(id);
    }

    async createTicket(ticket: CreateTicketRequest): Promise<{ id: string; location: string }> {
        if (!this.currentAgentId) {
            throw new Error('No agent logged in. Please login first.');
        }
        await this.ensureInitialized();
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

        const assignmentData: AssignTicketRequest = assignment || {agentId: this.currentAgentId};

        if (!assignmentData.agentId) {
            assignmentData.agentId = this.currentAgentId;
        }

        return apiService.assignTicket(this.currentAgentId, ticketId, assignmentData);
    }

    async deleteTicket(ticketId: string): Promise<void> {
        await this.ensureInitialized();
        return apiService.deleteTicket(ticketId);
    }

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

    async joinRoom(sessionId: string): Promise<void> {
        await this.ensureInitialized();
        return signalRService.joinRoom(sessionId);
    }

    async leaveRoom(sessionId: string): Promise<void> {
        await this.ensureInitialized();
        return signalRService.leaveRoom(sessionId);
    }

    async sendMessageViaSignalR(sessionId: string, text: string, attachments?: Attachment[]): Promise<void> {
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

    private async _doInitialize(): Promise<void> {
        try {
            console.log('[CommunicationService] Initializing...');

            const [healthResult] = await Promise.allSettled([
                apiService.getHealthStatus(),
                this._connectSignalR()
            ]);

            if (healthResult.status === 'rejected') {
                console.warn('[CommunicationService] Health check failed, but continuing:', healthResult.reason);
            } else {
                console.log('[CommunicationService] API connection established');
            }

            if (this.currentAgentId && this.currentAgentId !== 'undefined' && this.currentAgentId !== 'null') {
                this.startHeartbeat();
            } else {
                console.log('[CommunicationService] No valid agent ID, skipping heartbeat');
            }

            this.initialized = true;
            console.log('[CommunicationService] Initialization complete');
        } catch (error) {
            console.error('[CommunicationService] Initialization failed:', error);
            this.initialized = false;
            throw error;
        }
    }

    private async _connectSignalR(): Promise<void> {
        try {
            await signalRService.connect();
            console.log('[CommunicationService] SignalR connection established');
            this.signalRReadyResolve?.();
        } catch (error) {
            console.error('[CommunicationService] SignalR connection failed:', error);
            this.signalRReadyResolve?.();
            throw error;
        }
    }

    private startHeartbeat(): void {
        if (this.heartbeatInterval) {
            return;
        }

        console.log('[CommunicationService] Starting heartbeat');

        this.sendHeartbeat();

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
        if (!this.currentAgentId || this.currentAgentId === 'undefined' || this.currentAgentId === 'null') {
            console.warn('[CommunicationService] Invalid agent ID, skipping heartbeat');
            return;
        }

        try {
            await apiService.updateHeartbeat(this.currentAgentId);
            console.log('[CommunicationService] Heartbeat sent');
        } catch (error) {
            console.error('[CommunicationService] Heartbeat failed:', error);
        }
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

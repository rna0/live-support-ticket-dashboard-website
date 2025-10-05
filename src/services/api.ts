import axios, {type AxiosInstance, type AxiosResponse} from 'axios';
import type {
    AssignTicketRequest,
    CreateTicketPayload,
    CreateTicketRequest,
    PaginatedResponse,
    Ticket,
    TicketFilters,
    UpdateTicketStatusRequest
} from '../types/ticket';
import type {HealthCheckResponse as HealthResp} from '../types/health';
import type {
    AgentsPagedResponse,
    AgentStatusResponse,
    AuthResponse,
    GetAgentsParams,
    HeartbeatResponse,
    LoginRequest,
    LogoutResponse,
    RegisterRequest
} from '../types/auth';
import type {CreateSessionRequest, Message, MessagesResponse, SendMessageRequest, Session} from '../types/session';
import {TokenManager} from './api.token-manager';
import {ApiInterceptors} from './api.interceptors';
import {statusFromNumber, statusToString} from "@/enums/TicketStatus.ts";
import {priorityFromNumber, priorityToString} from "@/enums/Priority.ts";

class ApiService {
    private readonly axiosInstance: AxiosInstance;
    private readonly baseURL: string;
    private readonly tokenManager: TokenManager;
    private interceptors: ApiInterceptors;

    constructor(baseURL: string) {
        if (!baseURL) {
            throw new Error('ApiService requires a baseURL');
        }
        this.baseURL = baseURL.replace(/\/$/, '');

        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.tokenManager = new TokenManager();
        this.interceptors = new ApiInterceptors(this.axiosInstance, this.tokenManager, this.baseURL);
        this.interceptors.setupInterceptors();
    }

    getToken(): string | null {
        return this.tokenManager.getToken();
    }

    hasValidToken(): boolean {
        return this.tokenManager.hasValidToken();
    }

    getStoredAgentInfo(): { id: string | null; name: string | null; email: string | null } {
        return this.tokenManager.getStoredAgentInfo();
    }

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response: AxiosResponse = await this.axiosInstance.post('/agent/register', data);
        return this.handleAuthResponse(response);
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response: AxiosResponse = await this.axiosInstance.post('/agent/login', data);
        return this.handleAuthResponse(response);
    }

    async logout(agentId: string): Promise<LogoutResponse> {
        const response: AxiosResponse<LogoutResponse> = await this.axiosInstance.post(`/agent/${agentId}/logout`);
        this.tokenManager.clear();
        return response.data;
    }

    async getAllAgents(params?: GetAgentsParams): Promise<AgentsPagedResponse> {
        const queryParams = new URLSearchParams();

        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

        const url = `/agent${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response: AxiosResponse<AgentsPagedResponse> = await this.axiosInstance.get(url);
        return response.data;
    }

    async getAgentStatus(agentId: string): Promise<AgentStatusResponse> {
        const response: AxiosResponse<AgentStatusResponse> = await this.axiosInstance.get(`/agent/${agentId}/status`);
        return response.data;
    }

    async updateHeartbeat(agentId: string): Promise<HeartbeatResponse> {
        const response: AxiosResponse<HeartbeatResponse> = await this.axiosInstance.post(`/agent/${agentId}/heartbeat`);
        return response.data;
    }

    async getAllTickets(filters?: TicketFilters): Promise<PaginatedResponse<Ticket>> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', statusToString(filters.status));
        if (filters?.priority) params.append('priority', priorityToString(filters.priority));
        if (filters?.q) params.append('q', filters.q);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

        const response: AxiosResponse<Record<string, unknown>[]> = await this.axiosInstance.get(
            `/tickets${params.toString() ? `?${params.toString()}` : ''}`
        );

        const totalCount = parseInt(response.headers['x-total-count'] || '0', 10);
        const page = parseInt(response.headers['x-page'] || '1', 10);
        const pageSize = parseInt(response.headers['x-page-size'] || '20', 10);
        const totalPages = parseInt(response.headers['x-total-pages'] || '1', 10);

        return {
            data: response.data.map((ticket: Record<string, unknown>) => this.transformTicket(ticket)),
            totalCount,
            page,
            pageSize,
            totalPages
        };
    }

    async getTicketById(id: string): Promise<Ticket> {
        const response: AxiosResponse<Record<string, unknown>> = await this.axiosInstance.get(`/tickets/${id}`);
        return this.transformTicket(response.data);
    }

    async createTicket(agentId: string, ticket: CreateTicketRequest): Promise<{ id: string; location: string }> {
        const payload: CreateTicketPayload = {
            Title: ticket.title,
            Priority: ticket.priority
        };

        if (ticket.description && ticket.description.trim()) {
            payload.Description = ticket.description.trim();
        }

        if (ticket.assignedAgentId) {
            payload.AssignedAgentId = ticket.assignedAgentId;
        }

        const response: AxiosResponse<{ ticketId: string }> = await this.axiosInstance.post(
            `/agent/${agentId}/tickets`,
            payload
        );
        return {
            id: response.data.ticketId,
            location: response.headers['location'] || ''
        };
    }

    async updateTicketStatus(id: string, statusUpdate: UpdateTicketStatusRequest): Promise<void> {
        await this.axiosInstance.patch(`/tickets/${id}/status`, statusUpdate);
    }

    async assignTicket(agentId: string, ticketId: string, assignment?: AssignTicketRequest): Promise<void> {
        await this.axiosInstance.post(`/agent/${agentId}/assign/${ticketId}`, assignment || {});
    }

    async deleteTicket(ticketId: string): Promise<void> {
        await this.axiosInstance.delete(`/tickets/${ticketId}`);
    }

    async createSession(data: CreateSessionRequest): Promise<Session> {
        const response: AxiosResponse<Session> = await this.axiosInstance.post('/sessions', data);
        return response.data;
    }

    async getSession(sessionId: string): Promise<Session> {
        const response: AxiosResponse<Session> = await this.axiosInstance.get(`/sessions/${sessionId}`);
        return response.data;
    }

    async sendMessage(sessionId: string, data: SendMessageRequest): Promise<Message> {
        const response: AxiosResponse<Message> = await this.axiosInstance.post(
            `/sessions/${sessionId}/messages`,
            data
        );
        return response.data;
    }

    async getMessages(sessionId: string, afterMessageId?: string, limit: number = 50): Promise<MessagesResponse> {
        const params = new URLSearchParams();
        if (afterMessageId) params.append('afterMessageId', afterMessageId);
        params.append('limit', limit.toString());

        const response: AxiosResponse<MessagesResponse> = await this.axiosInstance.get(
            `/sessions/${sessionId}/messages?${params.toString()}`
        );
        return response.data;
    }

    async getHealthStatus(): Promise<HealthResp> {
        const response = await this.axiosInstance.get<HealthResp>('/health');
        return response.data;
    }

    private handleAuthResponse(response: AxiosResponse): AuthResponse {
        if (response.data.token) {
            this.tokenManager.setToken(response.data.token, response.data.refreshToken);
            const agentId = response.data.agentId;
            const name = response.data.name;
            const email = response.data.email;

            if (agentId) {
                this.tokenManager.saveAgentInfo(agentId, name, email);
            }

            response.data.id = agentId;
        }
        return response.data;
    }

    // Mapping functions for converting backend numeric values to frontend enums
    private transformTicket(ticket: Record<string, unknown>): Ticket {
        return {
            id: ticket.id as string,
            title: ticket.title as string,
            description: ticket.description as string,
            priority: priorityFromNumber(ticket.priority as number),
            status: statusFromNumber(ticket.status as number),
            assignedAgentId: ticket.assignedAgentId as string | undefined,
            assignedAgent: ticket.assignedAgent as string | undefined,
            createdAt: ticket.createdAt as string,
            updatedAt: ticket.updatedAt as string,
            slaTimeLeft: ticket.slaTimeLeft as string | undefined,
            history: ticket.history as Array<{
                id: string;
                timestamp: string;
                action: string;
                details: string;
                agent: string;
            }> | undefined
        };
    }
}

export {ApiService};

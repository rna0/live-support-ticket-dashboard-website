import axios, {type AxiosInstance, type AxiosResponse} from 'axios';
import type {
    AssignTicketRequest,
    CreateTicketRequest,
    PaginatedResponse,
    Ticket,
    TicketFilters,
    UpdateTicketStatusRequest
} from '../types/ticket';
import type {HealthCheckResponse as HealthResp} from '../types/health';
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

class ApiService {
    private axiosInstance: AxiosInstance;
    private baseURL: string;
    private token: string | null = null;

    constructor(baseURL: string) {
        if (!baseURL) {
            throw new Error('ApiService requires a baseURL');
        }
        // Normalize baseURL: remove trailing slash
        this.baseURL = baseURL.replace(/\/$/, '');

        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor for logging and auth
        this.axiosInstance.interceptors.request.use(
            (config) => {
                console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);

                // Add authorization header if token exists
                if (this.token) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                }

                return config;
            },
            (error) => {
                console.error('[API] Request error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.axiosInstance.interceptors.response.use(
            (response) => {
                console.log(`[API] Response ${response.status} from ${response.config.url}`);
                return response;
            },
            (error) => {
                console.error('[API] Response error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    // Token management
    setToken(token: string | null): void {
        this.token = token;
        if (token) {
            console.log('[API] Token set');
        } else {
            console.log('[API] Token cleared');
        }
    }

    getToken(): string | null {
        return this.token;
    }

    // Authentication endpoints
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response: AxiosResponse<AuthResponse> = await this.axiosInstance.post('/agent/register', data);
        if (response.data.token) {
            this.setToken(response.data.token);
        }
        return response.data;
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response: AxiosResponse<AuthResponse> = await this.axiosInstance.post('/agent/login', data);
        if (response.data.token) {
            this.setToken(response.data.token);
        }
        return response.data;
    }

    async logout(agentId: string): Promise<LogoutResponse> {
        const response: AxiosResponse<LogoutResponse> = await this.axiosInstance.post(`/agent/${agentId}/logout`);
        this.setToken(null);
        return response.data;
    }

    // Agent endpoints
    async getAllAgents(): Promise<Agent[]> {
        const response: AxiosResponse<Agent[]> = await this.axiosInstance.get('/agent');
        return response.data;
    }

    async getAgentStatus(agentId: string): Promise<AgentStatus> {
        const response: AxiosResponse<AgentStatus> = await this.axiosInstance.get(`/agent/${agentId}/status`);
        return response.data;
    }

    async updateHeartbeat(agentId: string): Promise<HeartbeatResponse> {
        const response: AxiosResponse<HeartbeatResponse> = await this.axiosInstance.post(`/agent/${agentId}/heartbeat`);
        return response.data;
    }

    // Ticket endpoints (updated to match API documentation)
    async getAllTickets(filters?: TicketFilters): Promise<PaginatedResponse<Ticket>> {
        const params = new URLSearchParams();

        if (filters?.status) params.append('status', filters.status);
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.q) params.append('q', filters.q);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

        const response: AxiosResponse<Ticket[]> = await this.axiosInstance.get(
            `/tickets${params.toString() ? `?${params.toString()}` : ''}`
        );

        // Extract pagination info from headers
        const totalCount = parseInt(response.headers['x-total-count'] || '0', 10);
        const page = parseInt(response.headers['x-page'] || '1', 10);
        const pageSize = parseInt(response.headers['x-page-size'] || '20', 10);
        const totalPages = parseInt(response.headers['x-total-pages'] || '1', 10);

        return {
            data: response.data,
            totalCount,
            page,
            pageSize,
            totalPages
        };
    }

    async getTicketById(id: string): Promise<Ticket> {
        const response: AxiosResponse<Ticket> = await this.axiosInstance.get(`/tickets/${id}`);
        return response.data;
    }

    async createTicket(agentId: string, ticket: CreateTicketRequest): Promise<{ id: string; location: string }> {
        const response: AxiosResponse<{ ticketId: string }> = await this.axiosInstance.post(
            `/agent/${agentId}/tickets`,
            ticket
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

    // Session endpoints
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

    // Health check
    async getHealthStatus(): Promise<HealthResp> {
        const response = await this.axiosInstance.get<HealthResp>('/health');
        return response.data;
    }

    // Update base URL if needed
    updateBaseURL(newBaseURL: string): void {
        this.baseURL = newBaseURL.replace(/\/$/, '');
        this.axiosInstance.defaults.baseURL = this.baseURL;
    }
}

// Remove singleton export, only export the class
export {ApiService};

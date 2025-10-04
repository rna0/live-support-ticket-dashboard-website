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

class ApiService {
    private axiosInstance: AxiosInstance;
    private baseURL: string;

    constructor(baseURL: string) {
        if (!baseURL) {
            throw new Error('ApiService requires a baseURL');
        }
        this.baseURL = baseURL;
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor for logging
        this.axiosInstance.interceptors.request.use(
            (config) => {
                console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
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

    // Ticket endpoints
    async getAllTickets(filters?: TicketFilters): Promise<PaginatedResponse<Ticket>> {
        const params = new URLSearchParams();

        if (filters?.status) params.append('status', filters.status);
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.q) params.append('q', filters.q);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

        const response: AxiosResponse<Ticket[]> = await this.axiosInstance.get(
            `/api/tickets${params.toString() ? `?${params.toString()}` : ''}`
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
        const response: AxiosResponse<Ticket> = await this.axiosInstance.get(`/api/tickets/${id}`);
        return response.data;
    }

    async createTicket(ticket: CreateTicketRequest): Promise<{ id: string; location: string }> {
        const response: AxiosResponse<{ id: string }> = await this.axiosInstance.post('/api/tickets', ticket);

        return {
            id: response.data.id,
            location: response.headers['location'] || ''
        };
    }

    async updateTicketStatus(id: string, statusUpdate: UpdateTicketStatusRequest): Promise<void> {
        await this.axiosInstance.patch(`/api/tickets/${id}/status`, statusUpdate);
    }

    async assignTicket(id: string, assignment: AssignTicketRequest): Promise<void> {
        await this.axiosInstance.post(`/api/tickets/${id}/assign`, assignment);
    }

    // Health check
    async getHealthStatus(): Promise<HealthResp> {
        const response = await this.axiosInstance.get<HealthResp>('/health');
        return response.data;
    }

    // Update base URL if needed
    updateBaseURL(newBaseURL: string): void {
        this.baseURL = newBaseURL;
        this.axiosInstance.defaults.baseURL = newBaseURL;
    }
}

// Remove singleton export, only export the class
export {ApiService};

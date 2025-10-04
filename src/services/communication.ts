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

const API_BASE_URL = import.meta.env.VITE_API_URL;
const SIGNALR_BASE_URL = import.meta.env.VITE_SIGNALR_URL;

if (!API_BASE_URL) throw new Error('Missing VITE_API_URL in environment');
if (!SIGNALR_BASE_URL) throw new Error('Missing VITE_SIGNALR_URL in environment');

const apiService = new ApiService(API_BASE_URL);
const signalRService = new SignalRService(SIGNALR_BASE_URL);

class CommunicationService {
    private initialized = false;

    constructor() {
        this.ensureInitialized();
    }

    async initialize(): Promise<void> {
        try {
            // No more env or fallback logic here, just use the constructed services
            await apiService.getHealthStatus();
            console.log('[CommunicationService] API connection established');
            await signalRService.connect();
            console.log('[CommunicationService] SignalR connection established');
            this.initialized = true;
        } catch (error) {
            console.error('[CommunicationService] Initialization failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        await signalRService.disconnect();
        this.initialized = false;
    }

    // REST API methods
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
        return apiService.createTicket(ticket);
    }

    async updateTicketStatus(id: string, status: UpdateTicketStatusRequest): Promise<void> {
        await this.ensureInitialized();
        return apiService.updateTicketStatus(id, status);
    }

    async assignTicket(id: string, assignment: AssignTicketRequest): Promise<void> {
        await this.ensureInitialized();
        return apiService.assignTicket(id, assignment);
    }

    async getHealthStatus(): Promise<HealthCheckResponse> {
        await this.ensureInitialized();
        return apiService.getHealthStatus();
    }

    // SignalR methods
    setEventHandlers(handlers: SignalREventHandlers): void {
        signalRService.setEventHandlers(handlers);
    }

    updateEventHandler<K extends keyof SignalREventHandlers>(
        event: K,
        handler: SignalREventHandlers[K]
    ): void {
        signalRService.updateEventHandler(event, handler);
    }

    // Add method to check SignalR connection status
    isSignalRConnected(): boolean {
        return signalRService.isConnected();
    }

    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }
}

const communicationService = new CommunicationService();
export default communicationService;
export {communicationService, API_BASE_URL, SIGNALR_BASE_URL};
export type {SignalREventHandlers};

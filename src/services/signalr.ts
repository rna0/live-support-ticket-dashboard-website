import {HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel} from '@microsoft/signalr';
import type {
    AgentConnectedPayload,
    AgentDisconnectedPayload,
    Ticket,
    TicketAssignedPayload,
    TicketStatusChangedPayload
} from '../types/ticket';

interface SignalREventHandlers {
    onTicketCreated?: (ticket: Ticket) => void;
    onTicketUpdated?: (ticket: Ticket) => void;
    onTicketStatusChanged?: (payload: TicketStatusChangedPayload) => void;
    onTicketAssigned?: (payload: TicketAssignedPayload) => void;
    onAgentConnected?: (payload: AgentConnectedPayload) => void;
    onAgentDisconnected?: (payload: AgentDisconnectedPayload) => void;
}

class SignalRService {
    private connection: HubConnection | null = null;
    private baseURL: string;
    private hubPath: string = '/hubs/live-support';
    private eventHandlers: SignalREventHandlers = {};
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectInterval: number = 5000; // 5 seconds

    constructor(baseURL: string) {
        if (!baseURL) {
            throw new Error('SignalRService requires a baseURL');
        }
        this.baseURL = baseURL;
    }

    async connect(): Promise<void> {
        if (this.connection && this.connection.state === HubConnectionState.Connected) {
            console.log('[SignalR] Already connected');
            return;
        }

        try {
            this.connection = new HubConnectionBuilder()
                .withUrl(`${this.baseURL}${this.hubPath}`)
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: (retryContext) => {
                        if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
                            return this.reconnectInterval;
                        }
                        return null; // Stop retrying
                    }
                })
                .configureLogging(LogLevel.Information)
                .build();

            this.connection.onclose(async (error) => {
                console.log('[SignalR] Connection closed', error);
                if (error) {
                    await this.handleReconnection();
                }
            });

            this.connection.onreconnecting((error) => {
                console.log('[SignalR] Reconnecting...', error);
            });

            this.connection.onreconnected((connectionId) => {
                console.log('[SignalR] Reconnected with ID:', connectionId);
                this.reconnectAttempts = 0;
            });

            // Register event handlers
            this.registerEventHandlers();

            await this.connection.start();
            console.log('[SignalR] Connected successfully');
            this.reconnectAttempts = 0;
        } catch (error) {
            console.error('[SignalR] Connection failed:', error);
            await this.handleReconnection();
        }
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            try {
                await this.connection.stop();
                console.log('[SignalR] Disconnected successfully');
            } catch (error) {
                console.error('[SignalR] Error during disconnect:', error);
            }
            this.connection = null;
        }
    }

    setEventHandlers(handlers: SignalREventHandlers): void {
        this.eventHandlers = {...this.eventHandlers, ...handlers};
    }

    updateEventHandler<K extends keyof SignalREventHandlers>(
        event: K,
        handler: SignalREventHandlers[K]
    ): void {
        this.eventHandlers[event] = handler;
    }

    isConnected(): boolean {
        return this.connection?.state === HubConnectionState.Connected;
    }

    updateBaseURL(newBaseURL: string): void {
        this.baseURL = newBaseURL;
        if (this.isConnected()) {
            console.log('[SignalR] Base URL changed, reconnecting...');
            this.disconnect().then(() => this.connect());
        }
    }

    private registerEventHandlers(): void {
        if (!this.connection) return;

        this.connection.on('TicketCreated', (ticket: Ticket) => {
            console.log('[SignalR] TicketCreated:', ticket);
            this.eventHandlers.onTicketCreated?.(ticket);
        });

        this.connection.on('TicketUpdated', (ticket: Ticket) => {
            console.log('[SignalR] TicketUpdated:', ticket);
            this.eventHandlers.onTicketUpdated?.(ticket);
        });

        this.connection.on('TicketStatusChanged', (payload: TicketStatusChangedPayload) => {
            console.log('[SignalR] TicketStatusChanged:', payload);
            this.eventHandlers.onTicketStatusChanged?.(payload);
        });

        this.connection.on('TicketAssigned', (payload: TicketAssignedPayload) => {
            console.log('[SignalR] TicketAssigned:', payload);
            this.eventHandlers.onTicketAssigned?.(payload);
        });

        this.connection.on('AgentConnected', (payload: AgentConnectedPayload) => {
            console.log('[SignalR] AgentConnected:', payload);
            this.eventHandlers.onAgentConnected?.(payload);
        });

        this.connection.on('AgentDisconnected', (payload: AgentDisconnectedPayload) => {
            console.log('[SignalR] AgentDisconnected:', payload);
            this.eventHandlers.onAgentDisconnected?.(payload);
        });
    }

    private async handleReconnection(): Promise<void> {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[SignalR] Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`[SignalR] Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

        setTimeout(async () => {
            try {
                await this.connect();
            } catch (error) {
                console.error('[SignalR] Reconnection failed:', error);
            }
        }, this.reconnectInterval);
    }
}

export {SignalRService};
export type {SignalREventHandlers};


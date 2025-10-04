import {HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel} from '@microsoft/signalr';
import type {
    AgentConnectedPayload,
    AgentDisconnectedPayload,
    Ticket,
    TicketAssignedPayload,
    TicketStatusChangedPayload
} from '../types/ticket';
import type {
    ReceiveMessagePayload,
    AgentTypingPayload,
    AgentJoinedPayload,
    AgentLeftPayload,
    UpdateQueuePayload
} from '../types/session';

interface SignalREventHandlers {
    // Ticket events
    onTicketCreated?: (ticket: Ticket) => void;
    onTicketUpdated?: (ticket: Ticket) => void;
    onTicketStatusChanged?: (payload: TicketStatusChangedPayload) => void;
    onTicketAssigned?: (payload: TicketAssignedPayload) => void;
    onAgentConnected?: (payload: AgentConnectedPayload) => void;
    onAgentDisconnected?: (payload: AgentDisconnectedPayload) => void;

    // Messaging events
    onReceiveMessage?: (payload: ReceiveMessagePayload) => void;
    onAgentTyping?: (payload: AgentTypingPayload) => void;
    onAgentJoined?: (payload: AgentJoinedPayload) => void;
    onAgentLeft?: (payload: AgentLeftPayload) => void;
    onUpdateQueue?: (payload: UpdateQueuePayload) => void;
}

class SignalRService {
    private connection: HubConnection | null = null;
    private baseURL: string;
    private hubPath: string = '/hubs';
    private eventHandlers: SignalREventHandlers = {};
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private getAccessToken: (() => string | null) | null = null;

    constructor(baseURL: string) {
        if (!baseURL) {
            throw new Error('SignalRService requires a baseURL');
        }
        // Normalize baseURL: remove trailing slash
        this.baseURL = baseURL.replace(/\/$/, '');
    }

    // Set token provider function
    setAccessTokenProvider(tokenProvider: () => string | null): void {
        this.getAccessToken = tokenProvider;
    }

    async connect(): Promise<void> {
        if (this.connection && this.connection.state === HubConnectionState.Connected) {
            console.log('[SignalR] Already connected');
            return;
        }

        try {
            const hubUrl = `${this.baseURL}${this.hubPath}`;
            console.log('[SignalR] Connecting to:', hubUrl);

            const builder = new HubConnectionBuilder()
                .withUrl(hubUrl, {
                    accessTokenFactory: () => {
                        const token = this.getAccessToken?.() || '';
                        if (!token) {
                            console.warn('[SignalR] No access token available');
                        }
                        return token;
                    }
                })
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: (retryContext) => {
                        // Exponential backoff: 0, 2, 10, 30 seconds, then stop
                        if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
                            return null; // Stop retrying
                        }

                        const delays = [0, 2000, 10000, 30000, 30000];
                        return delays[retryContext.previousRetryCount] || 30000;
                    }
                })
                .configureLogging(LogLevel.Information);

            this.connection = builder.build();

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

    // Client-to-server methods
    async sendMessage(sessionId: string, text: string, attachments?: any[]): Promise<void> {
        if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
            throw new Error('SignalR connection is not established');
        }
        await this.connection.invoke('SendMessage', { sessionId, text, attachments: attachments || [] });
    }

    async joinRoom(sessionId: string): Promise<void> {
        if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
            throw new Error('SignalR connection is not established');
        }
        await this.connection.invoke('JoinRoom', sessionId);
    }

    async leaveRoom(sessionId: string): Promise<void> {
        if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
            throw new Error('SignalR connection is not established');
        }
        await this.connection.invoke('LeaveRoom', sessionId);
    }

    async ping(): Promise<void> {
        if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
            throw new Error('SignalR connection is not established');
        }
        await this.connection.invoke('Ping');
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
        this.baseURL = newBaseURL.replace(/\/$/, '');
        if (this.isConnected()) {
            console.log('[SignalR] Base URL changed, reconnecting...');
            this.disconnect().then(() => this.connect());
        }
    }

    private registerEventHandlers(): void {
        if (!this.connection) return;

        // Ticket events
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

        // Messaging events (new)
        this.connection.on('ReceiveMessage', (payload: ReceiveMessagePayload) => {
            console.log('[SignalR] ReceiveMessage:', payload);
            this.eventHandlers.onReceiveMessage?.(payload);
        });

        this.connection.on('AgentTyping', (payload: AgentTypingPayload) => {
            console.log('[SignalR] AgentTyping:', payload);
            this.eventHandlers.onAgentTyping?.(payload);
        });

        this.connection.on('AgentJoined', (payload: AgentJoinedPayload) => {
            console.log('[SignalR] AgentJoined:', payload);
            this.eventHandlers.onAgentJoined?.(payload);
        });

        this.connection.on('AgentLeft', (payload: AgentLeftPayload) => {
            console.log('[SignalR] AgentLeft:', payload);
            this.eventHandlers.onAgentLeft?.(payload);
        });

        this.connection.on('UpdateQueue', (payload: UpdateQueuePayload) => {
            console.log('[SignalR] UpdateQueue:', payload);
            this.eventHandlers.onUpdateQueue?.(payload);
        });
    }

    private async handleReconnection(): Promise<void> {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[SignalR] Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`[SignalR] Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);

        setTimeout(async () => {
            try {
                await this.connect();
            } catch (error) {
                console.error('[SignalR] Reconnection failed:', error);
            }
        }, delay);
    }
}

export {SignalRService};
export type {SignalREventHandlers};

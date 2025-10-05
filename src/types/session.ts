// Session and messaging types based on API documentation

export interface CreateSessionRequest {
    userId: string;
    metadata?: Record<string, unknown>;
}

export interface Session {
    sessionId: string;
    userId: string;
    agentId?: string;
    status: string;
    createdAt: string;
    lastActivityAt?: string;
}

export interface SendMessageRequest {
    text: string;
    attachments?: Attachment[];
}

export interface Attachment {
    url: string;
    name: string;
    type: string;
}

export interface Message {
    messageId: string;
    sessionId: string;
    senderId: string;
    senderName?: string;
    senderType?: 'agent' | 'user';
    text: string;
    attachments?: Attachment[];
    createdAt: string;
    timestamp?: string;
}

export interface MessagesResponse {
    messages: Message[];
    hasMore: boolean;
}

export interface ReceiveMessagePayload {
    messageId: string;
    sessionId: string;
    senderId: string;
    senderName: string;
    senderType: 'agent' | 'user';
    text: string;
    attachments: Attachment[];
    timestamp: string;
}

export interface AgentTypingPayload {
    sessionId: string;
    agentId: string;
    agentName: string;
    isTyping: boolean;
}

export interface AgentJoinedPayload {
    sessionId: string;
    agentId: string;
    agentName: string;
    timestamp: string;
}

export interface AgentLeftPayload {
    sessionId: string;
    agentId: string;
    agentName: string;
    timestamp: string;
}

export interface UpdateQueuePayload {
    queueLength: number;
    waitingTickets: QueueTicket[];
    timestamp: string;
}

export interface QueueTicket {
    ticketId: string;
    subject: string;
    priority: string;
    waitTime: string;
}

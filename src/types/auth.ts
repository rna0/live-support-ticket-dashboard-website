// Authentication types based on API documentation

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    token: string;
    expiresAt?: string;
    refreshToken?: string;
    refreshTokenExpiresAt?: string;
}

export interface Agent {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export interface AgentResponse {
    agentId: string;
    name: string;
    isOnline: boolean;
    lastSeen: string;
}

export interface AgentsPagedResponse {
    agents: AgentResponse[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface GetAgentsParams {
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface AgentStatusResponse {
    agentId: string;
    name: string;
    isOnline: boolean;
    lastSeen: string;
    activeTicketsCount: number;
}

export interface AgentStatus {
    agentId: string;
    name: string;
    email: string;
    isOnline: boolean;
    lastHeartbeat: string;
    assignedTickets: AssignedTicket[];
}

export interface AssignedTicket {
    ticketId: string;
    userId: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
}

export interface HeartbeatResponse {
    message: string;
    timestamp: string;
}

export interface LogoutResponse {
    message: string;
}

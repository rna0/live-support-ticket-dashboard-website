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
}

export interface Agent {
    id: string;
    name: string;
    email: string;
    createdAt: string;
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


export interface Ticket {
    id: string;
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High" | "Critical";
    status: "Open" | "InProgress" | "Resolved";
    assignedAgentId?: string;
    assignedAgent?: string;
    createdAt: string; // ISO datetime string from API
    updatedAt: string; // ISO datetime string from API
    slaTimeLeft?: string;
    history?: TicketHistoryEntry[];
}

export interface Agent {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface TicketHistoryEntry {
    id: string;
    timestamp: string; // ISO datetime string from API
    action: string;
    details: string;
    agent: string;
}

// Request/Response types for API
export interface CreateTicketRequest {
    title: string;
    description?: string;
    priority: "Low" | "Medium" | "High" | "Critical";
    assignedAgentId?: string;
}

export interface UpdateTicketStatusRequest {
    status: "Open" | "InProgress" | "Resolved";
}

export interface AssignTicketRequest {
    agentId: string;
}

export interface TicketFilters {
    status?: "Open" | "InProgress" | "Resolved";
    priority?: "Low" | "Medium" | "High" | "Critical";
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// SignalR event payloads
export interface TicketStatusChangedPayload {
    TicketId: string;
    OldStatus: string;
    NewStatus: string;
    Timestamp: string;
}

export interface TicketAssignedPayload {
    TicketId: string;
    AgentId: string;
    AgentName: string;
    Timestamp: string;
}

export interface AgentConnectedPayload {
    AgentName: string;
    Timestamp: string;
}

export interface AgentDisconnectedPayload {
    AgentName: string;
    Timestamp: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved";
  assignedAgent: string;
  createdAt: Date;
  updatedAt: Date;
  slaTimeLeft?: string;
  history: TicketHistoryEntry[];
}

export interface TicketHistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
  agent: string;
}
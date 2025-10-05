// Status levels for tickets
export const TicketStatus = {
    Open: 1,
    InProgress: 2,
    Resolved: 3
} as const;

export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

// String representations for UI display
export const TicketStatusLabels: Record<TicketStatus, string> = {
    [TicketStatus.Open]: "Open",
    [TicketStatus.InProgress]: "InProgress",
    [TicketStatus.Resolved]: "Resolved"
};

// Helper functions for status conversion
export const statusFromNumber = (value: number): TicketStatus => {
    if (Object.values(TicketStatus).includes(value as TicketStatus)) {
        return value as TicketStatus;
    }
    return TicketStatus.Open; // Default fallback
};

export const statusToString = (status: TicketStatus): string => {
    return TicketStatusLabels[status];
};

export const statusFromString = (value: string): TicketStatus => {
    const entry = Object.entries(TicketStatusLabels).find(([, label]) => label === value);
    return entry ? Number(entry[0]) as TicketStatus : TicketStatus.Open;
};

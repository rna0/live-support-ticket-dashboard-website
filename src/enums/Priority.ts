// Priority levels for tickets
export const Priority = {
    Low: 0,
    Medium: 1,
    High: 2,
    Critical: 3
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

// String representations for UI display
export const PriorityLabels: Record<Priority, string> = {
    [Priority.Low]: "Low",
    [Priority.Medium]: "Medium",
    [Priority.High]: "High",
    [Priority.Critical]: "Critical"
};

// Helper functions for priority conversion
export const priorityFromNumber = (value: number): Priority => {
    if (Object.values(Priority).includes(value as Priority)) {
        return value as Priority;
    }
    return Priority.Medium; // Default fallback
};

export const priorityToString = (priority: Priority): string => {
    return PriorityLabels[priority];
};

export const priorityFromString = (value: string): Priority => {
    const entry = Object.entries(PriorityLabels).find(([, label]) => label === value);
    return entry ? Number(entry[0]) as Priority : Priority.Medium;
};

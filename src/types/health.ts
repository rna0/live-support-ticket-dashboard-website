export type HealthStatus =
    | 'Healthy'
    | 'Unhealthy'
    | 'Degraded'
    | 'healthy'
    | 'unhealthy'
    | 'degraded';

export interface HealthCheckEntry {
    status: HealthStatus;
    description?: string | null;
    data?: Record<string, unknown>;
    duration?: string;
}

export interface HealthCheckResponse {
    status: HealthStatus;
    totalDuration?: string;
    results?: {
        [key: string]: HealthCheckEntry;
    };
}


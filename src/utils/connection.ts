/**
 * Connection and communication utilities
 */

/**
 * Check if a URL is valid
 * @param url - URL string to validate
 * @returns Boolean indicating if URL is valid
 */
export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Create a connection status object
 * @param isApiConnected - API connection status
 * @param isSignalRConnected - SignalR connection status
 * @returns Connection status object
 */
export const createConnectionStatus = (isApiConnected: boolean, isSignalRConnected: boolean) => {
    return {
        isApiConnected,
        isSignalRConnected,
        isFullyConnected: isApiConnected && isSignalRConnected,
        connectionMessage: getConnectionMessage(isApiConnected, isSignalRConnected)
    };
};

/**
 * Get a human-readable connection status message
 * @param isApiConnected - API connection status
 * @param isSignalRConnected - SignalR connection status
 * @returns Status message string
 */
export const getConnectionMessage = (isApiConnected: boolean, isSignalRConnected: boolean): string => {
    if (isApiConnected && isSignalRConnected) {
        return "All services connected";
    }
    if (isApiConnected && !isSignalRConnected) {
        return "API connected, real-time updates unavailable";
    }
    if (!isApiConnected && isSignalRConnected) {
        return "Real-time connected, API unavailable";
    }
    return "All services disconnected";
};

/**
 * Retry function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise that resolves with the function result
 */
export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxRetries) {
                throw lastError;
            }

            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
};

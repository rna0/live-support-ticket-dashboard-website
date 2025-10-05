export const TOKEN_STORAGE_KEY = 'auth_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
export const AGENT_ID_STORAGE_KEY = 'agent_id';
export const AGENT_NAME_STORAGE_KEY = 'agent_name';
export const AGENT_EMAIL_STORAGE_KEY = 'agent_email';

export class TokenManager {
    private token: string | null = null;
    private refreshToken: string | null = null;

    constructor() {
        this.loadFromStorage();
    }

    setToken(token: string | null, refreshToken?: string | null): void {
        this.token = token;
        if (refreshToken !== undefined) {
            this.refreshToken = refreshToken;
        }

        if (token) {
            this.saveToStorage(token, refreshToken || undefined);
        } else {
            this.clearFromStorage();
        }
    }

    getToken(): string | null {
        return this.token;
    }

    getRefreshToken(): string | null {
        return this.refreshToken;
    }

    hasValidToken(): boolean {
        return !!this.token;
    }

    clear(): void {
        this.token = null;
        this.refreshToken = null;
        this.clearFromStorage();
    }

    saveAgentInfo(id: string, name: string, email: string): void {
        try {
            localStorage.setItem(AGENT_ID_STORAGE_KEY, id);
            localStorage.setItem(AGENT_NAME_STORAGE_KEY, name);
            localStorage.setItem(AGENT_EMAIL_STORAGE_KEY, email);
        } catch (error) {
            console.error('[TokenManager] Failed to save agent info:', error);
        }
    }

    getStoredAgentInfo(): { id: string | null; name: string | null; email: string | null } {
        try {
            return {
                id: localStorage.getItem(AGENT_ID_STORAGE_KEY),
                name: localStorage.getItem(AGENT_NAME_STORAGE_KEY),
                email: localStorage.getItem(AGENT_EMAIL_STORAGE_KEY),
            };
        } catch (error) {
            console.error('[TokenManager] Failed to get stored agent info:', error);
            return {id: null, name: null, email: null};
        }
    }

    private loadFromStorage(): void {
        try {
            this.token = localStorage.getItem(TOKEN_STORAGE_KEY);
            this.refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
            if (this.token) {
                console.log('[TokenManager] Token loaded from localStorage');
            }
        } catch (error) {
            console.error('[TokenManager] Failed to load token from storage:', error);
        }
    }

    private saveToStorage(token: string, refreshToken?: string): void {
        try {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
            if (refreshToken) {
                localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
            }
            console.log('[TokenManager] Token saved to localStorage');
        } catch (error) {
            console.error('[TokenManager] Failed to save token to storage:', error);
        }
    }

    private clearFromStorage(): void {
        try {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
            localStorage.removeItem(AGENT_ID_STORAGE_KEY);
            localStorage.removeItem(AGENT_NAME_STORAGE_KEY);
            localStorage.removeItem(AGENT_EMAIL_STORAGE_KEY);
            console.log('[TokenManager] Token cleared from localStorage');
        } catch (error) {
            console.error('[TokenManager] Failed to clear token from storage:', error);
        }
    }
}

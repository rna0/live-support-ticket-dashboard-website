import type {AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import axios from 'axios';
import type {AuthResponse} from '../types/auth';
import type {TokenManager} from './api.token-manager';

export class ApiInterceptors {
    private isRefreshing = false;
    private refreshSubscribers: Array<(token: string) => void> = [];
    private readonly axiosInstance: AxiosInstance;
    private tokenManager: TokenManager;
    private readonly baseURL: string;

    constructor(
        axiosInstance: AxiosInstance,
        tokenManager: TokenManager,
        baseURL: string
    ) {
        this.axiosInstance = axiosInstance;
        this.tokenManager = tokenManager;
        this.baseURL = baseURL;
    }

    setupInterceptors(): void {
        this.setupRequestInterceptor();
        this.setupResponseInterceptor();
    }

    private setupRequestInterceptor(): void {
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = this.tokenManager.getToken();
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                return config;
            },
            (error) => {
                console.error('[API] Request error:', error);
                return Promise.reject(error);
            }
        );
    }

    private setupResponseInterceptor(): void {
        this.axiosInstance.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        return this.waitForTokenRefresh(originalRequest);
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const newToken = await this.refreshAccessToken();
                        this.isRefreshing = false;
                        this.onTokenRefreshed(newToken);

                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        return this.axiosInstance(originalRequest);
                    } catch (refreshError) {
                        this.isRefreshing = false;
                        this.tokenManager.clear();
                        console.error('[API] Token refresh failed, clearing auth');
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    private waitForTokenRefresh(originalRequest: InternalAxiosRequestConfig): Promise<unknown> {
        return new Promise((resolve) => {
            this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.axiosInstance(originalRequest));
            });
        });
    }

    private onTokenRefreshed(token: string): void {
        this.refreshSubscribers.forEach(callback => callback(token));
        this.refreshSubscribers = [];
    }

    private async refreshAccessToken(): Promise<string> {
        const refreshToken = this.tokenManager.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await axios.post<AuthResponse>(
                `${this.baseURL}/agent/refresh`,
                {refreshToken}
            );

            const {token, refreshToken: newRefreshToken, id, name, email} = response.data;
            this.tokenManager.setToken(token, newRefreshToken);

            if (id && name && email) {
                this.tokenManager.saveAgentInfo(id, name, email);
            }

            return token;
        } catch (error) {
            console.error('[API] Token refresh failed:', error);
            throw error;
        }
    }
}

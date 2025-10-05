import React, {useCallback, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCommunicationService} from '../hooks/useCommunicationService';
import type {LoginRequest, RegisterRequest} from '../types/auth';
import {AuthContext, type AuthContextType} from './AuthContextTypes';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const navigate = useNavigate();

    const service = useCommunicationService({autoConnect: false});
    const {login: svcLogin, register: svcRegister, logout: svcLogout} = service;

    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const login = useCallback(async (data: LoginRequest) => {
        setIsAuthenticating(true);
        try {
            await svcLogin(data);
            navigate('/', {replace: true});
        } finally {
            setIsAuthenticating(false);
        }
    }, [svcLogin, navigate]);

    const register = useCallback(async (data: RegisterRequest) => {
        setIsAuthenticating(true);
        try {
            await svcRegister(data);
            navigate('/', {replace: true});
        } finally {
            setIsAuthenticating(false);
        }
    }, [svcRegister, navigate]);

    const logout = useCallback(async () => {
        await svcLogout();
        navigate('/login', {replace: true});
    }, [svcLogout, navigate]);

    const value = useMemo((): AuthContextType => ({
        isConnected: service.isConnected,
        isInitialized: service.isInitialized,
        currentAgentId: service.currentAgentId,
        currentAgentName: service.currentAgentName,
        currentAgentEmail: service.currentAgentEmail,
        error: service.error,
        isAuthenticating,

        login,
        register,
        logout,

        getAllAgents: service.getAllAgents,
        getTickets: service.getTickets,
        getTicket: service.getTicket,
        createTicket: service.createTicket,
        updateTicketStatus: service.updateTicketStatus,
        assignTicket: service.assignTicket,
        deleteTicket: service.deleteTicket,

        onTicketCreated: service.onTicketCreated,
        onTicketUpdated: service.onTicketUpdated,
        onTicketStatusChanged: service.onTicketStatusChanged,
    }), [service, isAuthenticating, login, register, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

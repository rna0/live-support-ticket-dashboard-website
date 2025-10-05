import {type RefObject, useCallback, useRef} from 'react';
import communicationService from '../services/communication';
import type {
    AgentConnectedPayload,
    AgentDisconnectedPayload,
    Ticket,
    TicketAssignedPayload,
    TicketStatusChangedPayload,
} from '../types/ticket';
import type {
    AgentJoinedPayload,
    AgentLeftPayload,
    AgentTypingPayload,
    ReceiveMessagePayload,
    UpdateQueuePayload
} from '../types/session';

export interface EventHandlers {
    onTicketCreated?: (ticket: Ticket) => void;
    onTicketUpdated?: (ticket: Ticket) => void;
    onTicketStatusChanged?: (payload: TicketStatusChangedPayload) => void;
    onTicketAssigned?: (payload: TicketAssignedPayload) => void;
    onAgentConnected?: (payload: AgentConnectedPayload) => void;
    onAgentDisconnected?: (payload: AgentDisconnectedPayload) => void;
    onReceiveMessage?: (payload: ReceiveMessagePayload) => void;
    onAgentTyping?: (payload: AgentTypingPayload) => void;
    onAgentJoined?: (payload: AgentJoinedPayload) => void;
    onAgentLeft?: (payload: AgentLeftPayload) => void;
    onUpdateQueue?: (payload: UpdateQueuePayload) => void;
}

export interface EventHandlersHook {
    onTicketCreated: (handler: (ticket: Ticket) => void) => void;
    onTicketUpdated: (handler: (ticket: Ticket) => void) => void;
    onTicketStatusChanged: (handler: (payload: TicketStatusChangedPayload) => void) => void;
    onTicketAssigned: (handler: (payload: TicketAssignedPayload) => void) => void;
    onAgentConnected: (handler: (payload: AgentConnectedPayload) => void) => void;
    onAgentDisconnected: (handler: (payload: AgentDisconnectedPayload) => void) => void;
    onReceiveMessage: (handler: (payload: ReceiveMessagePayload) => void) => void;
    onAgentTyping: (handler: (payload: AgentTypingPayload) => void) => void;
    onAgentJoined: (handler: (payload: AgentJoinedPayload) => void) => void;
    onAgentLeft: (handler: (payload: AgentLeftPayload) => void) => void;
    onUpdateQueue: (handler: (payload: UpdateQueuePayload) => void) => void;
}

export const useEventHandlers = (): EventHandlersHook & { eventHandlersRef: RefObject<EventHandlers> } => {
    const eventHandlersRef = useRef<EventHandlers>({});

    const onTicketCreated = useCallback((handler: (ticket: Ticket) => void) => {
        eventHandlersRef.current.onTicketCreated = handler;
        communicationService.updateEventHandler('onTicketCreated', handler);
    }, []);

    const onTicketUpdated = useCallback((handler: (ticket: Ticket) => void) => {
        eventHandlersRef.current.onTicketUpdated = handler;
        communicationService.updateEventHandler('onTicketUpdated', handler);
    }, []);

    const onTicketStatusChanged = useCallback((handler: (payload: TicketStatusChangedPayload) => void) => {
        eventHandlersRef.current.onTicketStatusChanged = handler;
        communicationService.updateEventHandler('onTicketStatusChanged', handler);
    }, []);

    const onTicketAssigned = useCallback((handler: (payload: TicketAssignedPayload) => void) => {
        eventHandlersRef.current.onTicketAssigned = handler;
        communicationService.updateEventHandler('onTicketAssigned', handler);
    }, []);

    const onAgentConnected = useCallback((handler: (payload: AgentConnectedPayload) => void) => {
        eventHandlersRef.current.onAgentConnected = handler;
        communicationService.updateEventHandler('onAgentConnected', handler);
    }, []);

    const onAgentDisconnected = useCallback((handler: (payload: AgentDisconnectedPayload) => void) => {
        eventHandlersRef.current.onAgentDisconnected = handler;
        communicationService.updateEventHandler('onAgentDisconnected', handler);
    }, []);

    const onReceiveMessage = useCallback((handler: (payload: ReceiveMessagePayload) => void) => {
        eventHandlersRef.current.onReceiveMessage = handler;
        communicationService.updateEventHandler('onReceiveMessage', handler);
    }, []);

    const onAgentTyping = useCallback((handler: (payload: AgentTypingPayload) => void) => {
        eventHandlersRef.current.onAgentTyping = handler;
        communicationService.updateEventHandler('onAgentTyping', handler);
    }, []);

    const onAgentJoined = useCallback((handler: (payload: AgentJoinedPayload) => void) => {
        eventHandlersRef.current.onAgentJoined = handler;
        communicationService.updateEventHandler('onAgentJoined', handler);
    }, []);

    const onAgentLeft = useCallback((handler: (payload: AgentLeftPayload) => void) => {
        eventHandlersRef.current.onAgentLeft = handler;
        communicationService.updateEventHandler('onAgentLeft', handler);
    }, []);

    const onUpdateQueue = useCallback((handler: (payload: UpdateQueuePayload) => void) => {
        eventHandlersRef.current.onUpdateQueue = handler;
        communicationService.updateEventHandler('onUpdateQueue', handler);
    }, []);

    return {
        eventHandlersRef,
        onTicketCreated,
        onTicketUpdated,
        onTicketStatusChanged,
        onTicketAssigned,
        onAgentConnected,
        onAgentDisconnected,
        onReceiveMessage,
        onAgentTyping,
        onAgentJoined,
        onAgentLeft,
        onUpdateQueue,
    };
};

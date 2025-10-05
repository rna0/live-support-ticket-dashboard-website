import {useCallback, useEffect, useState} from "react";
import {Header} from "./components/Header";
import {Sidebar} from "./components/Sidebar";
import {TicketList} from "./components/TicketList";
import {TicketDetails} from "./components/TicketDetails";
import {Login} from "./components/Login";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle} from "./components/ui/sheet";
import type {Ticket} from "./types/ticket";
import {useAuth} from "./hooks/useAuth";
import {Navigate, Route, Routes} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateTicket from "./pages/CreateTicket";

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);


    const auth = useAuth();
    const {
        isConnected,
        isInitialized,
        error,
        currentAgentId,
        currentAgentName,
        isAuthenticating,
        login,
        register,
        logout,
        getTickets,
        updateTicketStatus,
        deleteTicket,
        onTicketCreated,
        onTicketUpdated,
        onTicketStatusChanged,
    } = auth;

    const loadTickets = useCallback(async () => {
        try {
            const response = await getTickets();
            setTickets(response.data);
        } catch (error) {
            console.error('Failed to load tickets from backend:', error);
            setTickets([]);
        }
    }, [getTickets]);

    useEffect(() => {
        if (isConnected && isInitialized) {
            loadTickets();
        }
    }, [isConnected, isInitialized, loadTickets]);

    useEffect(() => {
        if (!isInitialized) return;

        onTicketCreated((ticket: Ticket) => {
            console.log('New ticket created via SignalR:', ticket);
            setTickets(prev => [ticket, ...prev]);
        });

        onTicketUpdated((ticket: Ticket) => {
            console.log('Ticket updated via SignalR:', ticket);
            setTickets(prev => prev.map(t => t.id === ticket.id ? ticket : t));
            if (selectedTicket?.id === ticket.id) {
                setSelectedTicket(ticket);
            }
        });

        onTicketStatusChanged((payload) => {
            console.log('Ticket status changed via SignalR:', payload);
            loadTickets();
        });
    }, [isInitialized, onTicketCreated, onTicketUpdated, onTicketStatusChanged, selectedTicket, loadTickets]);

    const handleTicketUpdate = async (ticketId: string, updates: Partial<Ticket>) => {
        if (updates.status) {
            try {
                await updateTicketStatus(ticketId, {status: updates.status});
            } catch (error) {
                console.error('Failed to update ticket status:', error);
            }
        }

        setTickets(prev =>
            prev.map(ticket =>
                ticket.id === ticketId
                    ? {...ticket, ...updates}
                    : ticket
            )
        );

        if (selectedTicket?.id === ticketId) {
            setSelectedTicket(prev => prev ? {...prev, ...updates} : null);
        }
    };

    const handleDeleteTicket = async (ticketId: string) => {
        try {
            await deleteTicket(ticketId);
            setTickets(prev => prev.filter(t => t.id !== ticketId));
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket(null);
            }
        } catch (error) {
            console.error('Failed to delete ticket:', error);
            throw error;
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setTickets([]);
            setSelectedTicket(null);
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    // Redirect to log in if not authenticated
    const isAuthenticated = isInitialized || currentAgentId;

    return (
        <div className="h-screen flex flex-col bg-background">
            {isAuthenticated && (
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                    agentName={currentAgentName || 'Agent'}
                    isOnline={isConnected}
                    onLogout={handleLogout}
                />
            )}

            <div className="flex flex-1 overflow-hidden">
                {isAuthenticated && (
                    <Sidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 overflow-hidden">
                    <Routes>
                        <Route path="/login" element={
                            isAuthenticated ? <Navigate to="/" replace/> : (
                                <Login
                                    onLogin={login}
                                    onRegister={register}
                                    error={error}
                                    isLoading={isAuthenticating}
                                />
                            )
                        }/>

                        <Route path="/" element={
                            isAuthenticated ? <Dashboard tickets={tickets}/> : <Navigate to="/login" replace/>
                        }/>

                        <Route path="/tickets" element={
                            isAuthenticated ? (
                                <TicketList
                                    tickets={tickets}
                                    onTicketClick={setSelectedTicket}
                                />
                            ) : <Navigate to="/login" replace/>
                        }/>

                        <Route path="/tickets/create" element={
                            isAuthenticated ? <CreateTicket/> : <Navigate to="/login" replace/>
                        }/>


                        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace/>}/>
                    </Routes>
                </main>
            </div>

            {/* Ticket Details Sheet */}
            {isAuthenticated && (
                <Sheet open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
                    <SheetContent className="w-full sm:max-w-2xl">
                        <SheetHeader className="sr-only">
                            <SheetTitle>
                                {selectedTicket ? `Ticket ${selectedTicket.id}` : "Ticket Details"}
                            </SheetTitle>
                            <SheetDescription>
                                View and manage ticket information
                            </SheetDescription>
                        </SheetHeader>
                        {selectedTicket && (
                            <TicketDetails
                                ticket={selectedTicket}
                                onClose={() => setSelectedTicket(null)}
                                onUpdate={handleTicketUpdate}
                                onDelete={handleDeleteTicket}
                            />
                        )}
                    </SheetContent>
                </Sheet>
            )}
        </div>
    );
}
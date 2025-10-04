import {useCallback, useEffect, useState} from "react";
import {Header} from "./components/Header";
import {Sidebar} from "./components/Sidebar";
import {TicketList} from "./components/TicketList";
import {TicketDetails} from "./components/TicketDetails";
import {Login} from "./components/Login";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle} from "./components/ui/sheet";
import {Card, CardContent, CardHeader, CardTitle} from "./components/ui/card";
import {Badge} from "./components/ui/badge";
import type {Ticket} from "./types/ticket";
import type {LoginRequest, RegisterRequest} from "./types/auth";
import {useCommunicationService} from "./hooks/useCommunicationService";
import {AlertCircle, BarChart3, CheckCircle, Clock} from "lucide-react";
import {getTicketStats} from "./utils";

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Use communication service with authentication
    const {
        isConnected,
        isInitialized,
        error,
        currentAgentId,
        login,
        register,
        logout,
        getTickets,
        updateTicketStatus,
        onTicketCreated,
        onTicketUpdated,
        onTicketStatusChanged,
    } = useCommunicationService({autoConnect: false}); // Don't auto-connect, wait for authentication

    const loadTickets = useCallback(async () => {
        try {
            const response = await getTickets();
            setTickets(response.data);
        } catch (error) {
            console.error('Failed to load tickets from backend:', error);
            setTickets([]);
        }
    }, [getTickets]);

    // Handle login
    const handleLogin = async (data: LoginRequest) => {
        setIsAuthenticating(true);
        try {
            await login(data);
            console.log('Login successful');
        } catch (err) {
            console.error('Login failed:', err);
        } finally {
            setIsAuthenticating(false);
        }
    };

    // Handle registration
    const handleRegister = async (data: RegisterRequest) => {
        setIsAuthenticating(true);
        try {
            await register(data);
            console.log('Registration successful');
        } catch (err) {
            console.error('Registration failed:', err);
        } finally {
            setIsAuthenticating(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            setTickets([]);
            setSelectedTicket(null);
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    // Load tickets when connected
    useEffect(() => {
        if (isConnected && isInitialized) {
            loadTickets();
        }
    }, [isConnected, isInitialized, loadTickets]);

    // Set up real-time event handlers
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

    const handleCreateTicket = () => {
        // In a real app, this would open a create ticket modal
        // For now, just log - the example component shows how to create tickets
        console.log("Create new ticket - see CommunicationServiceExample component for implementation");
    };

    // Show login screen if not authenticated
    if (!isInitialized || !currentAgentId) {
        return (
            <Login
                onLogin={handleLogin}
                onRegister={handleRegister}
                error={error}
                isLoading={isAuthenticating}
            />
        );
    }

    const stats = getTicketStats(tickets);

    const renderDashboard = () => (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here's an overview of your support tickets.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open</CardTitle>
                        <AlertCircle className="h-4 w-4 text-blue-500"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.byStatus.open}</div>
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white mt-2">
                            Open
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.byStatus.inProgress}</div>
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white mt-2">
                            In Progress
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.byStatus.resolved}</div>
                        <Badge className="bg-green-500 hover:bg-green-600 text-white mt-2">
                            Resolved
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.byPriority.critical}</div>
                        <Badge className="bg-red-500 hover:bg-red-600 text-white mt-2">
                            Critical
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm">
                                    <span className="font-medium">2 new tickets</span> were just assigned to you
                                </p>
                                <p className="text-xs text-muted-foreground">2 minutes ago</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm">
                                    <span className="font-medium">Ticket T-006</span> was resolved
                                </p>
                                <p className="text-xs text-muted-foreground">1 hour ago</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm">
                                    <span className="font-medium">SLA warning</span> for 1 critical ticket
                                </p>
                                <p className="text-xs text-muted-foreground">3 hours ago</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderSettings = () => (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your account and notification preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-muted-foreground">Receive notifications for new tickets</p>
                            </div>
                            <Badge>Enabled</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">SLA Alerts</p>
                                <p className="text-sm text-muted-foreground">Get warned when tickets approach SLA
                                    deadline</p>
                            </div>
                            <Badge>Enabled</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Auto-assignment</p>
                                <p className="text-sm text-muted-foreground">Automatically assign new tickets to you</p>
                            </div>
                            <Badge variant="secondary">Disabled</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-background">
            <Header
                onMenuClick={() => setSidebarOpen(true)}
                agentName="Sarah Wilson"
                isOnline={true}
            />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <main className="flex-1 overflow-hidden">
                    {activeTab === "dashboard" && renderDashboard()}
                    {activeTab === "tickets" && (
                        <TicketList
                            tickets={tickets}
                            onTicketClick={setSelectedTicket}
                            onCreateTicket={handleCreateTicket}
                        />
                    )}
                    {activeTab === "settings" && renderSettings()}
                </main>
            </div>

            {/* Ticket Details Sheet */}
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
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
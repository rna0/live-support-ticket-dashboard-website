import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card";
import {Badge} from "../components/ui/badge";
import {AlertCircle, BarChart3, CheckCircle, Clock, Inbox} from "lucide-react";
import type {Ticket} from "../types/ticket";
import {getTicketStats} from "@/utils/ticket.ts";

interface DashboardProps {
    tickets: Ticket[];
}

export default function Dashboard({tickets}: DashboardProps) {
    const stats = getTicketStats(tickets);

    return (
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

            {/* Recent Tickets */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    {tickets.length > 0 ? (
                        <div className="space-y-4">
                            {tickets.map((ticket) => (
                                <div key={ticket.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{ticket.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {ticket.description
                                                ? `${ticket.description.substring(0, 60)}${ticket.description.length > 60 ? '...' : ''}`
                                                : 'No description'}
                                        </p>
                                    </div>
                                    <Badge variant="outline">{ticket.status}</Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No tickets found</p>
                        </div>
                    )}
                </CardContent>
            </Card>

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
}

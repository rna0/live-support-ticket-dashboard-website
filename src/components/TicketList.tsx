import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Card, CardContent, CardHeader} from "./ui/card";
import {Badge} from "./ui/badge";
import {Button} from "./ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {Clock, Plus, Search, Ticket as TicketIcon, User} from "lucide-react";
import type {Ticket} from "../types/ticket";
import {Input} from "@/components/ui/input.tsx";
import {TicketStatusLabels} from "@/enums/TicketStatus.ts";
import {PriorityLabels} from "@/enums/Priority.ts";
import {getAssignedAgentName, getPriorityColorClasses, getStatusColorClasses} from "@/utils/ticket.ts";
import {formatDateCompact} from "@/utils/date.ts";

interface TicketListProps {
    tickets: Ticket[];
    onTicketClick: (ticket: Ticket) => void;
}

export function TicketList({tickets, onTicketClick}: TicketListProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const filteredTickets = tickets.filter((ticket) => {
        const title = ticket.title;
        const description = ticket.description;
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            description.toLowerCase().includes(searchQuery.toLowerCase());

        const ticketStatus = TicketStatusLabels[ticket.status];
        const ticketPriority = PriorityLabels[ticket.priority];

        const matchesStatus = statusFilter === "all" || ticketStatus === statusFilter;
        const matchesPriority = priorityFilter === "all" || ticketPriority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    return (
        <div className="flex flex-col h-full">
            {/* Filter Controls */}
            <div className="p-6 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Support Tickets</h1>
                    <Button onClick={() => navigate("/tickets/create")}>
                        <Plus className="h-4 w-4 mr-2"/>
                        Create Ticket
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                        <Input
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Status"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="InProgress">In Progress</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Priority"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Ticket List */}
            <div className="flex-1 overflow-auto p-6">
                {filteredTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <TicketIcon className="h-12 w-12 text-muted-foreground mb-4"/>
                        <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                                ? "Try adjusting your filters"
                                : "Create your first ticket to get started"}
                        </p>
                        {!searchQuery && statusFilter === "all" && priorityFilter === "all" && (
                            <Button onClick={() => navigate("/tickets/create")}>
                                <Plus className="h-4 w-4 mr-2"/>
                                Create First Ticket
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTickets.map((ticket) => {
                            const status = ticket.status;
                            const priority = ticket.priority;
                            const assigned = getAssignedAgentName(ticket);

                            return (
                                <Card
                                    key={ticket.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => onTicketClick(ticket)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium truncate">{ticket.title}</h3>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {ticket.description}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <Badge className={getPriorityColorClasses(priority)}>
                                                    {PriorityLabels[priority]}
                                                </Badge>
                                                <Badge className={getStatusColorClasses(status)}>
                                                    {TicketStatusLabels[status]}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div
                                            className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4"/>
                                                <span>{assigned}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4"/>
                                                <span>{formatDateCompact(ticket.createdAt)}</span>
                                            </div>
                                            {ticket.slaTimeLeft && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4"/>
                                                    <span>SLA: {ticket.slaTimeLeft}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
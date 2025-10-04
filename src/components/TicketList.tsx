import {useState} from "react";
import {Card, CardContent, CardHeader} from "./ui/card";
import {Badge} from "./ui/badge";
import {Button} from "./ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {Clock, Plus, Search, Ticket as TicketIcon, User} from "lucide-react";
import type {Ticket} from "../types/ticket";
import {Input} from "@/components/ui/input.tsx";
import {formatDateCompact, getAssignedAgentName, getPriorityColorClasses, getStatusColorClasses} from "../utils";

interface TicketListProps {
    tickets: Ticket[];
    onTicketClick: (ticket: Ticket) => void;
    onCreateTicket: () => void;
}

export function TicketList({tickets, onTicketClick, onCreateTicket}: TicketListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const filteredTickets = tickets.filter((ticket) => {
        const title = ticket.title;
        const description = ticket.description;
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            description.toLowerCase().includes(searchQuery.toLowerCase());

        const ticketStatus = ticket.status;
        const ticketPriority = ticket.priority;

        const matchesStatus = statusFilter === "all" || ticketStatus === statusFilter;
        const matchesPriority = priorityFilter === "all" || ticketPriority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    return (
        <div className="flex flex-col h-full">
            {/* Filter Controls */}
            <div className="p-6 border-b space-y-4">
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
                                        <div className="flex gap-2">
                                            <Badge className={getPriorityColorClasses(priority)}>
                                                {ticket.priority}
                                            </Badge>
                                            <Badge className={getStatusColorClasses(status)}>
                                                {ticket.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3"/>
                                                <span>{assigned}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3"/>
                                                <span>{formatDateCompact(ticket.updatedAt)}</span>
                                            </div>
                                        </div>
                                        {ticket.slaTimeLeft && (
                                            <Badge variant="outline" className="text-xs">
                                                SLA: {ticket.slaTimeLeft}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {filteredTickets.length === 0 && (
                        <div className="text-center text-muted-foreground py-12">
                            <TicketIcon className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                            <p>No tickets found matching your criteria</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Create Button */}
            <Button
                onClick={onCreateTicket}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
                size="icon"
            >
                <Plus className="h-6 w-6"/>
            </Button>
        </div>
    );
}
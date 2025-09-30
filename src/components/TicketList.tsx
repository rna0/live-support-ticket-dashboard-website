import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Plus, Clock, User, Ticket as TicketIcon } from "lucide-react";
import type {Ticket} from "../types/ticket";
import {Input} from "@/components/ui/input.tsx";

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onCreateTicket: () => void;
}

export function TicketList({ tickets, onTicketClick, onCreateTicket }: TicketListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500 text-white hover:bg-red-600";
      case "high": return "bg-orange-500 text-white hover:bg-orange-600";
      case "medium": return "bg-yellow-500 text-black hover:bg-yellow-600";
      case "low": return "bg-green-500 text-white hover:bg-green-600";
      default: return "bg-gray-500 text-white hover:bg-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-500 text-white hover:bg-blue-600";
      case "in-progress": return "bg-orange-500 text-white hover:bg-orange-600";
      case "resolved": return "bg-green-500 text-white hover:bg-green-600";
      default: return "bg-gray-500 text-white hover:bg-gray-600";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filter Controls */}
      <div className="p-6 border-b space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
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
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{ticket.assignedAgent}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(ticket.updatedAt)}</span>
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
          ))}
          
          {filteredTickets.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <TicketIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
import type {Ticket} from "../types/ticket";
import {Badge} from "./ui/badge";
import {Button} from "./ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {Textarea} from "./ui/textarea";
import {Separator} from "./ui/separator";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Calendar, Clock, User} from "lucide-react";
import {useState} from "react";

interface TicketDetailsProps {
    ticket: Ticket;
    onClose: () => void;
    onUpdate: (ticketId: string, updates: Partial<Ticket>) => void;
}

export function TicketDetails({ticket, onClose: onCloseProp, onUpdate}: TicketDetailsProps) {
    const [status, setStatus] = useState(ticket.status);
    const [priority, setPriority] = useState(ticket.priority);
    const [assignedAgent, setAssignedAgent] = useState(ticket.assignedAgent);

    const handleStatusChange = (value: string) => setStatus(value as Ticket["status"]);
    const handlePriorityChange = (value: string) => setPriority(value as Ticket["priority"]);
    const handleAssignedAgentChange = (value: string) => setAssignedAgent(value);

    const agents = [
        "John Smith",
        "Sarah Wilson",
        "Mike Johnson",
        "Emily Davis",
        "Alex Brown"
    ];

    const handleSave = () => {
        onUpdate(ticket.id, {
            status,
            priority,
            assignedAgent,
            updatedAt: new Date()
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "critical":
                return "bg-red-500 text-white hover:bg-red-600";
            case "high":
                return "bg-orange-500 text-white hover:bg-orange-600";
            case "medium":
                return "bg-yellow-500 text-black hover:bg-yellow-600";
            case "low":
                return "bg-green-500 text-white hover:bg-green-600";
            default:
                return "bg-gray-500 text-white hover:bg-gray-600";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open":
                return "bg-blue-500 text-white hover:bg-blue-600";
            case "in-progress":
                return "bg-orange-500 text-white hover:bg-orange-600";
            case "resolved":
                return "bg-green-500 text-white hover:bg-green-600";
            default:
                return "bg-gray-500 text-white hover:bg-gray-600";
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Ticket #{ticket.id}</h2>
                    <div className="flex gap-2">
                        <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                        </Badge>
                    </div>
                </div>
                <div>
                    <Button variant="outline" onClick={onCloseProp}>Close</Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Ticket Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>{ticket.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">{ticket.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground"/>
                                <span className="text-muted-foreground">Created:</span>
                                <span>{formatDate(ticket.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground"/>
                                <span className="text-muted-foreground">Updated:</span>
                                <span>{formatDate(ticket.updatedAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground"/>
                                <span className="text-muted-foreground">Assigned:</span>
                                <span>{ticket.assignedAgent}</span>
                            </div>
                            {ticket.slaTimeLeft && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground"/>
                                    <span className="text-muted-foreground">SLA Time Left:</span>
                                    <Badge variant="outline">{ticket.slaTimeLeft}</Badge>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Update Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Update Ticket</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={status} onValueChange={handleStatusChange}>
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={priority} onValueChange={handlePriorityChange}>
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Assigned Agent</label>
                                <Select value={assignedAgent} onValueChange={handleAssignedAgentChange}>
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {agents.map((agent) => (
                                            <SelectItem key={agent} value={agent}>
                                                {agent}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Add Comment</label>
                            <Textarea placeholder="Add your comment here..."/>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleSave}>Save Changes</Button>
                            <Button variant="outline">Add Comment</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Activity History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {ticket.history.map((entry, index) => (
                                <div key={entry.id}>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-medium">{entry.agent}</span>
                                                <span className="text-muted-foreground">{entry.action}</span>
                                                <span className="text-muted-foreground">
                          {formatDate(entry.timestamp)}
                        </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {entry.details}
                                            </p>
                                        </div>
                                    </div>
                                    {index < ticket.history.length - 1 && (
                                        <Separator className="my-4"/>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
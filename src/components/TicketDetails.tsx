import {type Ticket} from "../types/ticket";
import {Badge} from "./ui/badge";
import {Button} from "./ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {Separator} from "./ui/separator";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {AlertCircle, Calendar, Clock, Loader2, Save, Trash2, User} from "lucide-react";
import {useEffect, useState} from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {useAuth} from "@/hooks/useAuth";
import {AgentSearchSelect} from "@/components/AgentSearchSelect";
import {getAssignedAgentName, getPriorityColorClasses, getStatusColorClasses} from "@/utils/ticket.ts";
import {formatDateFull} from "@/utils/date.ts";
import {TicketStatus, type TicketStatus as TicketStatusType, TicketStatusLabels} from "@/enums/TicketStatus.ts";
import {Priority, type Priority as PriorityType, PriorityLabels} from "@/enums/Priority.ts";

interface TicketDetailsProps {
    ticket: Ticket;
    onClose: () => void;
    onUpdate: (ticketId: string, updates: Partial<Ticket>) => void;
    onDelete?: (ticketId: string) => void;
}

export function TicketDetails({ticket, onClose, onUpdate, onDelete}: TicketDetailsProps) {
    const {updateTicketStatus, assignTicket} = useAuth();

    const [status, setStatus] = useState<TicketStatusType>(ticket.status);
    const [priority, setPriority] = useState<PriorityType>(ticket.priority);
    const [assignedAgentId, setAssignedAgentId] = useState<string>(ticket.assignedAgentId || "unassigned");

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const changed =
            status !== ticket.status ||
            priority !== ticket.priority ||
            assignedAgentId !== (ticket.assignedAgentId || "unassigned");
        setHasChanges(changed);
    }, [status, priority, assignedAgentId, ticket]);

    const handleSave = async () => {
        setError(null);
        setIsSaving(true);

        try {
            if (status !== ticket.status) {
                await updateTicketStatus(ticket.id, {status});
            }

            if (assignedAgentId !== "unassigned" && assignedAgentId !== ticket.assignedAgentId) {
                await assignTicket(ticket.id, {agentId: assignedAgentId});
            }

            onUpdate(ticket.id, {
                status,
                priority,
                assignedAgentId: assignedAgentId === "unassigned" ? undefined : assignedAgentId,
                updatedAt: new Date().toISOString()
            });

            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update ticket");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;

        setShowDeleteDialog(false);
        setIsSaving(true);

        try {
            onDelete(ticket.id);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete ticket");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b gap-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Ticket #{ticket.id}</h2>
                    <div className="flex gap-2">
                        <Badge className={getPriorityColorClasses(ticket.priority)}>
                            {PriorityLabels[ticket.priority]}
                        </Badge>
                        <Badge className={getStatusColorClasses(ticket.status)}>
                            {TicketStatusLabels[ticket.status]}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-2">
                    {onDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isSaving}
                        >
                            <Trash2 className="h-4 w-4 mr-2"/>
                            Delete
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Close
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>{ticket.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground"/>
                                <span className="text-muted-foreground">Created:</span>
                                <span>{formatDateFull(ticket.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground"/>
                                <span className="text-muted-foreground">Updated:</span>
                                <span>{formatDateFull(ticket.updatedAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground"/>
                                <span className="text-muted-foreground">Assigned:</span>
                                <span>{getAssignedAgentName(ticket)}</span>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Update Ticket</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    value={status.toString()}
                                    onValueChange={(value) => setStatus(Number(value) as TicketStatusType)}
                                    disabled={isSaving}
                                >
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value={TicketStatus.Open.toString()}>{TicketStatusLabels[TicketStatus.Open]}</SelectItem>
                                        <SelectItem
                                            value={TicketStatus.InProgress.toString()}>{TicketStatusLabels[TicketStatus.InProgress]}</SelectItem>
                                        <SelectItem
                                            value={TicketStatus.Resolved.toString()}>{TicketStatusLabels[TicketStatus.Resolved]}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select
                                    value={priority.toString()}
                                    onValueChange={(value) => setPriority(Number(value) as PriorityType)}
                                    disabled={isSaving}
                                >
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value={Priority.Low.toString()}>{PriorityLabels[Priority.Low]}</SelectItem>
                                        <SelectItem
                                            value={Priority.Medium.toString()}>{PriorityLabels[Priority.Medium]}</SelectItem>
                                        <SelectItem
                                            value={Priority.High.toString()}>{PriorityLabels[Priority.High]}</SelectItem>
                                        <SelectItem
                                            value={Priority.Critical.toString()}>{PriorityLabels[Priority.Critical]}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assigned Agent</label>
                            <AgentSearchSelect
                                value={assignedAgentId}
                                onValueChange={setAssignedAgentId}
                                disabled={isSaving}
                                placeholder="Select agent"
                                allowUnassigned={true}
                            />
                        </div>

                        <Separator/>

                        <Button
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving}
                            className="w-full"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4"/>
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {ticket.history && ticket.history.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {ticket.history.map((entry) => (
                                    <div key={entry.id} className="flex gap-4 text-sm">
                                        <div className="text-muted-foreground min-w-[120px]">
                                            {formatDateFull(entry.timestamp)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{entry.action}</div>
                                            <div className="text-muted-foreground">{entry.details}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                by {entry.agent}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete ticket #{ticket.id}
                            and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}
                                           className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
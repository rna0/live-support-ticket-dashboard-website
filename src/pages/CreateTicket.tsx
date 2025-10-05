import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertCircle, ArrowLeft, Loader2, Save} from "lucide-react";
import {useAuth} from "@/hooks/useAuth";
import type {CreateTicketRequest} from "@/types/ticket";
import {AgentSearchSelect} from "@/components/AgentSearchSelect";
import {Priority, PriorityLabels} from "@/enums/Priority.ts";

export default function CreateTicket() {
    const navigate = useNavigate();
    const {createTicket, currentAgentId, isInitialized} = useAuth();

    const [formData, setFormData] = useState<CreateTicketRequest>({
        title: "",
        description: "",
        priority: Priority.Medium,
        assignedAgentId: undefined,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.title.trim()) {
            errors.title = "Title is required";
        } else if (formData.title.trim().length < 5) {
            errors.title = "Title must be at least 5 characters";
        } else if (formData.title.trim().length > 200) {
            errors.title = "Title must be less than 200 characters";
        }

        if (formData.description && formData.description.trim().length > 5000) {
            errors.description = "Description must be less than 5000 characters";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Check if user is authenticated before submitting
        if (!currentAgentId) {
            setError("You must be logged in to create a ticket");
            return;
        }

        if (!isInitialized) {
            setError("System is still initializing. Please wait a moment and try again.");
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const ticketData: CreateTicketRequest = {
                title: formData.title.trim(),
                description: formData.description?.trim() || undefined,
                priority: formData.priority,
                assignedAgentId: formData.assignedAgentId || undefined,
            };

            await createTicket(ticketData);
            navigate("/tickets");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create ticket");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/tickets");
    };

    // Show loading state while initializing
    if (!isInitialized) {
        return (
            <div className="container max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4"/>
                    <p className="text-muted-foreground">Initializing...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    disabled={isLoading}
                >
                    <ArrowLeft className="h-5 w-5"/>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Create New Ticket</h1>
                    <p className="text-muted-foreground">Fill in the details to create a support ticket</p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4"/>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Ticket Information</CardTitle>
                        <CardDescription>
                            Provide the necessary information about the support ticket
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="Brief description of the issue"
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData({...formData, title: e.target.value});
                                    if (validationErrors.title) {
                                        setValidationErrors({...validationErrors, title: ""});
                                    }
                                }}
                                disabled={isLoading}
                                className={validationErrors.title ? "border-destructive" : ""}
                            />
                            {validationErrors.title && (
                                <p className="text-sm text-destructive">{validationErrors.title}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Detailed description of the issue..."
                                value={formData.description}
                                onChange={(e) => {
                                    setFormData({...formData, description: e.target.value});
                                    if (validationErrors.description) {
                                        setValidationErrors({...validationErrors, description: ""});
                                    }
                                }}
                                disabled={isLoading}
                                rows={6}
                                className={validationErrors.description ? "border-destructive" : ""}
                            />
                            {validationErrors.description && (
                                <p className="text-sm text-destructive">{validationErrors.description}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                {formData.description?.length || 0} / 5000 characters
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="priority">
                                    Priority <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={formData.priority.toString()}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            priority: Number(value) as Priority,
                                        })
                                    }
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="priority">
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

                            <div className="space-y-2">
                                <Label htmlFor="assignedAgent">Assign to Agent (Optional)</Label>
                                <AgentSearchSelect
                                    value={formData.assignedAgentId || "unassigned"}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            assignedAgentId: value === "unassigned" ? undefined : value,
                                        })
                                    }
                                    disabled={isLoading}
                                    placeholder="Select agent"
                                    allowUnassigned={true}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={isLoading} className="flex-1">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4"/>
                                        Create Ticket
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}

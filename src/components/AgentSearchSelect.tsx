import {useCallback, useEffect, useState} from "react";
import {Loader2, Search} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {useAuth} from "@/hooks/useAuth";
import type {AgentResponse} from "@/types/auth";

interface AgentSearchSelectProps {
    value?: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    allowUnassigned?: boolean;
}

export function AgentSearchSelect({
                                      value,
                                      onValueChange,
                                      disabled = false,
                                      placeholder = "Select agent...",
                                      allowUnassigned = true
                                  }: AgentSearchSelectProps) {
    const {getAllAgents} = useAuth();

    const [search, setSearch] = useState("");
    const [agents, setAgents] = useState<AgentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const loadAgents = useCallback(async (searchTerm: string = "") => {
        try {
            setIsLoading(true);
            const response = await getAllAgents({
                search: searchTerm || undefined,
                page: 1,
                pageSize: 50 // Load more agents at once since we don't have pagination in simple select
            });

            setAgents(response.agents);
        } catch (err) {
            console.error("Failed to load agents:", err);
        } finally {
            setIsLoading(false);
        }
    }, [getAllAgents]);

    // Load agents when component mounts or when search changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadAgents(search);
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [search, loadAgents]);

    // Load agents initially when select opens
    useEffect(() => {
        if (isOpen && agents.length === 0) {
            loadAgents();
        }
    }, [isOpen, agents.length, loadAgents]);

    const selectedAgent = agents.find(agent => agent.agentId === value);
    const displayValue = value === "unassigned"
        ? "Unassigned"
        : selectedAgent?.name || (value ? `Agent (${value.substring(0, 8)}...)` : undefined);

    const filteredAgents = search
        ? agents.filter(agent =>
            agent.name.toLowerCase().includes(search.toLowerCase())
        )
        : agents;

    return (
        <Select
            value={value || ""}
            onValueChange={onValueChange}
            disabled={disabled}
            onOpenChange={setIsOpen}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder}>
                    {displayValue}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                <div className="flex items-center border-b px-3 pb-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50"/>
                    <Input
                        placeholder="Search agents by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                        <span className="ml-2 text-sm text-muted-foreground">Loading agents...</span>
                    </div>
                ) : (
                    <div className="max-h-[200px] overflow-y-auto">
                        {allowUnassigned && (
                            <SelectItem value="unassigned">
                                Unassigned
                            </SelectItem>
                        )}
                        {filteredAgents.length === 0 && search ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                No agents found.
                            </div>
                        ) : (
                            filteredAgents.map((agent) => (
                                <SelectItem key={agent.agentId} value={agent.agentId}>
                                    <div className="flex flex-col">
                                        <span>{agent.name}</span>
                                        {agent.isOnline && (
                                            <span className="text-xs text-muted-foreground flex items-center">
                                                <span
                                                    className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                                                Online
                                            </span>
                                        )}
                                    </div>
                                </SelectItem>
                            ))
                        )}
                    </div>
                )}
            </SelectContent>
        </Select>
    );
}

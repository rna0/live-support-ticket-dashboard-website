import {Button} from "./ui/button";
import {LayoutDashboard, Settings, Ticket, X} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {useLocation, useNavigate} from "react-router-dom";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navigationItems = [
    {id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/"},
    {id: "tickets", label: "My Tickets", icon: Ticket, path: "/tickets"},
    {id: "settings", label: "Settings", icon: Settings, path: "/settings"},
];

export function Sidebar({isOpen, onClose}: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r transform transition-transform duration-200 ease-in-out z-50",
                    "md:relative md:top-0 md:h-full md:transform-none md:z-auto",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 md:hidden">
                        <span>Navigation</span>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4"/>
                        </Button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path || (item.path === "/" && location.pathname === "/");
                            return (
                                <Button
                                    key={item.id}
                                    variant={isActive ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-3"
                                    onClick={() => {
                                        navigate(item.path);
                                        onClose();
                                    }}
                                >
                                    <Icon className="h-4 w-4"/>
                                    {item.label}
                                </Button>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </>
    );
}
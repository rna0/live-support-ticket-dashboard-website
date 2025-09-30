import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Menu, Settings } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  agentName: string;
  isOnline: boolean;
}

export function Header({ onMenuClick, agentName, isOnline }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-semibold">ST</span>
          </div>
          <span className="font-semibold text-lg">SupportTech</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{agentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-sm">{agentName}</span>
              <Badge variant={isOnline ? "default" : "secondary"} className={isOnline ? "bg-green-500 hover:bg-green-600" : ""}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
          </div>
        </div>
        
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
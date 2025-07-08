import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/d1a98d01-e608-4ca7-ac80-7e02fd96ec19.png" 
            alt="Terrah Homes" 
            className="h-8 w-auto"
          />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Terrah Homes</h1>
            <p className="text-xs text-muted-foreground">Gestão de Tarefas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-terrah-orange text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
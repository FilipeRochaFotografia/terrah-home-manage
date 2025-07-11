import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div className="relative overflow-hidden">
        {/* Gradiente sutil de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-terrah-turquoise/5 via-transparent to-terrah-orange/5"></div>
        
        <div className="relative flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3 group">
            <div className="relative">
          <img 
                src="/lovable-uploads/logo.png" 
            alt="Terrah Homes" 
                className="h-10 w-auto transition-transform duration-200 group-hover:scale-105"
          />
            </div>
          <div>
              <h1 className="text-2xl font-bold text-terrah-orange">
                Terrah Homes
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Gestão de Demandas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-terrah-turquoise/10 transition-colors duration-200"
            >
            <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-terrah-orange text-xs text-white flex items-center justify-center font-bold animate-pulse">
              3
            </span>
          </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-terrah-turquoise/10 transition-colors duration-200"
            >
            <Settings className="h-5 w-5" />
          </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-terrah-turquoise/10 transition-colors duration-200"
            >
            <User className="h-5 w-5" />
          </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
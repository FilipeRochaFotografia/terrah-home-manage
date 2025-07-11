import { Home, CheckSquare, Building2, Users, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Início", icon: Home },
  { id: "tasks", label: "Tarefas", icon: CheckSquare },
  { id: "properties", label: "Imóveis", icon: Building2 },
  { id: "employees", label: "Funcionários", icon: Users },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "settings", label: "Config", icon: Settings }
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border shadow-lg">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-0 flex-1 relative group",
                isActive
                  ? "text-terrah-turquoise"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
              {/* Indicador de fundo ativo */}
              {isActive && (
                <div className="absolute inset-0 bg-terrah-turquoise/10 rounded-xl animate-in slide-in-from-bottom-1 duration-300" />
              )}
              
              {/* Ícone com animação */}
              <div className={cn(
                "relative z-10 transition-all duration-300",
                isActive ? "scale-110" : "group-hover:scale-105"
              )}>
            <item.icon className="h-5 w-5" />
              </div>
              
              {/* Label com animação */}
              <span className={cn(
                "text-xs font-medium relative z-10 transition-all duration-300",
                isActive ? "text-terrah-turquoise font-semibold" : ""
              )}>
                {item.label}
              </span>
              
              {/* Indicador de linha ativa */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-terrah-turquoise rounded-full animate-in slide-in-from-bottom-1 duration-300" />
              )}
          </button>
          );
        })}
      </div>
    </nav>
  );
}
import { Home, CheckSquare, Building2, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Início", icon: Home },
  { id: "tasks", label: "Tarefas", icon: CheckSquare },
  { id: "properties", label: "Imóveis", icon: Building2 },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "settings", label: "Config", icon: Settings }
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1",
              activeTab === item.id
                ? "bg-terrah-turquoise/10 text-terrah-turquoise"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
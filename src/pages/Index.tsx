import { useState } from "react";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { PropertyList } from "@/components/PropertyList";
import { BottomNav } from "@/components/BottomNav";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "tasks":
        return <TaskList />;
      case "properties":
        return <PropertyList />;
      case "reports":
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Relatórios</h2>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        );
      case "settings":
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Configurações</h2>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        {renderContent()}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

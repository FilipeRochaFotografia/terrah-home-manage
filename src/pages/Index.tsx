import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { PropertyList } from "@/components/PropertyList";
import { FuncionariosList } from "@/components/FuncionariosList";
import { BottomNav } from "@/components/BottomNav";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Listener para navegação entre abas
    const handleNavigateToTab = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    // Listener para abrir modal de nova tarefa
    const handleOpenNewTaskModal = () => {
      // Disparar evento para o TaskList abrir o modal
      const openModalEvent = new CustomEvent('openTaskModal');
      window.dispatchEvent(openModalEvent);
    };

    window.addEventListener('navigateToTab', handleNavigateToTab as EventListener);
    window.addEventListener('openNewTaskModal', handleOpenNewTaskModal);

    return () => {
      window.removeEventListener('navigateToTab', handleNavigateToTab as EventListener);
      window.removeEventListener('openNewTaskModal', handleOpenNewTaskModal);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "tasks":
        return <TaskList />;
      case "properties":
        return <PropertyList />;
      case "employees":
        return <FuncionariosList />;
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

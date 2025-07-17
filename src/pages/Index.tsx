import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { PropertyList } from "@/components/PropertyList";
import { FuncionariosList } from "@/components/FuncionariosList";
import ReportsPage from "@/pages/ReportsPage";
import { BottomNav } from "@/components/BottomNav";
import type { NavigateToTabEvent, OpenTaskModalEvent } from "@/types/events";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Listener para navegação entre abas
    const handleNavigateToTab = (event: Event) => {
      const customEvent = event as NavigateToTabEvent;
      setActiveTab(customEvent.detail);
    };

    // Listener para abrir modal de nova tarefa
    const handleOpenNewTaskModal = () => {
      // Disparar evento para o TaskList abrir o modal
      const openModalEvent: OpenTaskModalEvent = new CustomEvent("openTaskModal");
      window.dispatchEvent(openModalEvent);
    };

    window.addEventListener("navigateToTab", handleNavigateToTab);
    window.addEventListener("openNewTaskModal", handleOpenNewTaskModal);

    return () => {
      window.removeEventListener("navigateToTab", handleNavigateToTab);
      window.removeEventListener("openNewTaskModal", handleOpenNewTaskModal);
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
      case "reports":
        return <ReportsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        {renderContent()}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

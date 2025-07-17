import { useState, useEffect } from "react";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { PropertyList } from "@/components/PropertyList";
import { FuncionariosList } from "@/components/FuncionariosList";
import type { NavigateToTabEvent, OpenTaskModalEvent } from "@/types/events";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const handleNavigateToTab = (event: Event) => {
      const customEvent = event as NavigateToTabEvent;
      setActiveTab(customEvent.detail.tab); // Corrigido para acessar a propriedade tab
    };

    const handleOpenNewTaskModal = (event: Event) => {
      const openModalEvent: OpenTaskModalEvent = new CustomEvent("openTaskModal", { 
        detail: (event as CustomEvent).detail 
      });
      window.dispatchEvent(openModalEvent);
    };

    window.addEventListener("navigateToTab", handleNavigateToTab);
    window.addEventListener("openNewTaskModal", handleOpenNewTaskModal);

    // Listener para o BottomNav
    const handleTabChange = (event: Event) => {
        const customEvent = event as CustomEvent;
        setActiveTab(customEvent.detail);
    };
    window.addEventListener("tabChange", handleTabChange);


    return () => {
      window.removeEventListener("navigateToTab", handleNavigateToTab);
      window.removeEventListener("openNewTaskModal", handleOpenNewTaskModal);
      window.removeEventListener("tabChange", handleTabChange);
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
    <div className="container mx-auto px-4 py-6">
      {renderContent()}
    </div>
  );
};

export default Index;

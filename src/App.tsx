import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useMemoryMonitor, useMemoryLeakDetector } from "@/hooks/useMemoryMonitor";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from './pages/Login';
import TarefaDetail from './pages/TarefaDetail';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Tentar novamente até 2 vezes em caso de falha
      refetchOnWindowFocus: true, // Re-buscar dados ao focar na janela
    },
  },
});

const App = () => {
  // Ativar monitoramento de memória apenas em desenvolvimento
  useMemoryMonitor(true, 120000); // Log a cada 2 minutos
  useMemoryLeakDetector(true);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Index />} />
                <Route path="/tarefas/:id" element={<TarefaDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </AuthProvider>
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

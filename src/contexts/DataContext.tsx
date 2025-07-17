import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Interfaces para os dados
interface Imovel {
  id: string;
  nome: string;
}

interface Funcionario {
  id: string;
  nome: string;
  user_id: string;
  cargo?: string; // Adicionar cargo como opcional
}

// Interface para o contexto
interface DataContextProps {
  imoveis: Imovel[];
  funcionarios: Funcionario[];
  loading: boolean;
  refreshData: () => void;
}

// Cria o contexto com um valor padrão
const DataContext = createContext<DataContextProps>({
  imoveis: [],
  funcionarios: [],
  loading: true,
  refreshData: () => {},
});

// Hook customizado para usar o contexto
export const useData = () => useContext(DataContext);

// Provedor do contexto
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const imoveisPromise = supabase.from("imoveis").select("id, nome").order("nome");
      const funcionariosPromise = supabase.from("funcionarios").select("id, nome, user_id, cargo").eq("ativo", true).order("nome");

      const [imoveisResult, funcionariosResult] = await Promise.all([imoveisPromise, funcionariosPromise]);
      
      if (imoveisResult.data) setImoveis(imoveisResult.data);
      if (funcionariosResult.data) setFuncionarios(funcionariosResult.data);
      
    } catch (error) {
      console.error("Erro ao buscar dados centrais:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = {
    imoveis,
    funcionarios,
    loading,
    refreshData: fetchData,
  };

  return (
    <DataContext.Provider value={value}>
      {!loading && children}
    </DataContext.Provider>
  );
}; 
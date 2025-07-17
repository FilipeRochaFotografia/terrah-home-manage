import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  nome: string;
  email: string;
  isAdmin: boolean;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  userInfo: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error("Erro ao buscar sessão no AuthProvider:", error);
      } finally {
        setLoading(false);
      }
    };

    getSessionData();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser);
      } else {
        setUserInfo(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (currentUser: User) => {
    const { data: profile, error } = await supabase
      .from('funcionarios')
      .select('nome, email, is_admin')
      .eq('user_id', currentUser.id)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      // Fallback para os metadados do usuário se o perfil não for encontrado
      setUserInfo({
        nome: currentUser.user_metadata?.name || 'Usuário',
        email: currentUser.email || '',
        isAdmin: false,
      });
    } else {
      setUserInfo({
        nome: profile.nome,
        email: profile.email,
        isAdmin: !!profile.is_admin,
      });
    }
  };
  
  const value = {
    user,
    userInfo,
    loading,
    isAdmin: userInfo?.isAdmin || false,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 
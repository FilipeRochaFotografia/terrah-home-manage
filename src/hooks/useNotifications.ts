import { useState, useEffect, useRef, useCallback } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  user_id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  task_id?: string;
  enviada_em: string;
  status: string;
  fcm_response?: any;
  created_at: string;
  updated_at: string;
}

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const tokenRequestedRef = useRef(false);
  const { toast } = useToast();

  // Calcular notificações não lidas
  const unreadCount = notifications.filter(n => n.status === 'enviada').length;

  // Função para carregar notificações do banco de dados
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('enviada_em', { ascending: false })
        .limit(50);

      if (error) {
        // Se a tabela não existir, não mostrar erro no console
        if (error.code === '42P01') {
          console.log('Tabela de notificações não existe ainda. Notificações desabilitadas.');
          setNotifications([]);
          return;
        }
        console.error('Erro ao carregar notificações:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ status: 'lida' })
        .eq('id', notificationId);

      if (error) {
        // Se a tabela não existir, apenas atualizar estado local
        if (error.code === '42P01') {
          setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, status: 'lida' } : n)
          );
          return;
        }
        console.error('Erro ao marcar notificação como lida:', error);
        return;
      }

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, status: 'lida' } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Função para marcar todas as notificações como lidas
  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('notificacoes')
        .update({ status: 'lida' })
        .eq('user_id', user.id)
        .eq('status', 'enviada');

      if (error) {
        // Se a tabela não existir, apenas atualizar estado local
        if (error.code === '42P01') {
          setNotifications(prev => prev.map(n => ({ ...n, status: 'lida' })));
          return;
        }
        console.error('Erro ao marcar todas as notificações como lidas:', error);
        return;
      }

      // Atualizar estado local
      setNotifications(prev => prev.map(n => ({ ...n, status: 'lida' })));
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  // 1. Verifica se o navegador suporta notificações
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Criar toast estável para evitar recriação do listener
  const stableToast = useCallback((options: any) => {
    toast(options);
  }, [toast]);

  // 2. Lida com mensagens em primeiro plano (apenas uma vez)
  useEffect(() => {
    if (!isSupported || permission !== 'granted') return;

    let unsubscribe: (() => void) | null = null;
    
    try {
      const messaging = getMessaging(app);
      unsubscribe = onMessage(messaging, (payload) => {
        stableToast({
          title: payload.notification?.title || "Nova Notificação",
          description: payload.notification?.body || "",
        });
      });
    } catch (error) {
      console.error('Erro ao configurar listener de mensagens:', error);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isSupported, permission, stableToast]);

  // 3. Função para solicitar permissão e obter o token
  const requestPermissionAndGetToken = async (userId: string) => {
    // Evitar chamadas múltiplas
    if (isProcessing || tokenRequestedRef.current) {
      return;
    }

    if (!isSupported) {
      return;
    }

    if (!userId) {
      return;
    }

    setIsProcessing(true);
    tokenRequestedRef.current = true;

    try {
      if (permission === 'granted') {
        await setupToken(userId);
        return;
      }

      if (permission === 'denied') {
        toast({
          title: "Permissão de Notificação Negada",
          description: "Para receber notificações, habilite-as nas configurações do seu navegador.",
          variant: "destructive",
        });
        return;
      }

      // Solicita a permissão apenas se ainda não foi solicitada
      if (permission === 'default') {
        const newPermission = await Notification.requestPermission();
        setPermission(newPermission);

        if (newPermission === 'granted') {
          await setupToken(userId);
        }
      }
    } catch (error) {
      console.error('[useNotifications] Erro ao solicitar permissão de notificação:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Função para obter token e salvar no Supabase
  const setupToken = async (userId: string) => {
    try {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      
      if (!vapidKey) {
        console.error("[useNotifications] VAPID Key do Firebase não configurada!");
        toast({
          title: "Erro de Configuração",
          description: "A chave de notificação (VAPID) não foi encontrada.",
          variant: "destructive"
        });
        return;
      }

      // Verificar se já existe um token salvo para este usuário
      const { data: existingFuncionario, error: checkError } = await supabase
        .from('funcionarios')
        .select('fcm_token')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('[useNotifications] Erro ao verificar token existente no Supabase:', checkError);
        return;
      }

      if (existingFuncionario?.fcm_token) {
        return;
      }

      const messaging = getMessaging(app);
      const token = await getToken(messaging, { vapidKey });

      if (token) {
        // Salva o token na tabela 'funcionarios' associado ao usuário
        const { error } = await supabase
          .from('funcionarios')
          .update({ fcm_token: token })
          .eq('user_id', userId);

        if (error) {
          console.error('[useNotifications] Erro ao salvar o token FCM no Supabase:', error);
          throw error;
        } else {
          toast({
            title: "Notificações Ativadas",
            description: "Você receberá notificações sobre suas tarefas.",
          });
        }
      }
    } catch (error) {
      console.error('[useNotifications] Ocorreu um erro geral em setupToken:', error);
      toast({
        title: "Erro nas Notificações",
        description: "Não foi possível configurar as notificações. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  return { 
    isSupported, 
    permission, 
    requestPermissionAndGetToken,
    isProcessing,
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead
  };
} 
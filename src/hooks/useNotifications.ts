import { useState, useEffect, useRef } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isProcessing, setIsProcessing] = useState(false);
  const tokenRequestedRef = useRef(false);
  const { toast } = useToast();

  // 1. Verifica se o navegador suporta notificações
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // 2. Lida com mensagens em primeiro plano (apenas uma vez)
  useEffect(() => {
    if (!isSupported || permission !== 'granted') return;

    let unsubscribe: (() => void) | null = null;
    
    try {
      const messaging = getMessaging(app);
      unsubscribe = onMessage(messaging, (payload) => {
        toast({
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
  }, [isSupported, permission, toast]);

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
    isProcessing 
  };
} 
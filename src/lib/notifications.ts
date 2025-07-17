import { supabase } from './supabaseClient';

// Tipos de notificação disponíveis
export type NotificationType = 
  | 'task_assigned' 
  | 'task_due_soon' 
  | 'task_overdue' 
  | 'task_completed';

// Interface para os parâmetros da notificação
interface NotificationParams {
  type: NotificationType;
  userId: string;
  taskId?: string;
  title?: string;
  message?: string;
  data?: Record<string, any>;
}

/**
 * Envia uma notificação push para um usuário específico
 */
export async function sendPushNotification(params: NotificationParams) {
  try {
    // A lógica de buscar o token FCM foi movida para a Edge Function por segurança.
    // O cliente apenas invoca a função com os dados necessários.
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: params
    });

    if (error) {
      console.error('Erro ao invocar a edge function "send-notification":', error);
      // O erro pode ser de network ou da própria função (ex: token não encontrado)
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (error) {
    console.error('Erro inesperado ao enviar notificação:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

/**
 * Envia notificação quando uma tarefa é atribuída a um funcionário
 */
export async function notifyTaskAssigned(userId: string, taskId: string, taskTitle: string) {
  return sendPushNotification({
    type: 'task_assigned',
    userId,
    taskId,
    title: taskTitle,
  });
}

/**
 * Envia notificação quando uma tarefa está próxima do vencimento
 */
export async function notifyTaskDueSoon(userId: string, taskId: string, taskTitle: string) {
  return sendPushNotification({
    type: 'task_due_soon',
    userId,
    taskId,
    title: taskTitle,
  });
}

/**
 * Envia notificação quando uma tarefa está atrasada
 */
export async function notifyTaskOverdue(userId: string, taskId: string, taskTitle: string) {
  return sendPushNotification({
    type: 'task_overdue',
    userId,
    taskId,
    title: taskTitle,
  });
}

/**
 * Envia notificação quando uma tarefa é concluída
 */
export async function notifyTaskCompleted(userId: string, taskId: string, taskTitle: string) {
  return sendPushNotification({
    type: 'task_completed',
    userId,
    taskId,
    title: taskTitle,
  });
}

/**
 * Verifica se as notificações estão habilitadas para o usuário atual
 */
export async function checkNotificationStatus() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { enabled: false, reason: 'Usuário não logado' };

  const { data: funcionario } = await supabase
    .from('funcionarios')
    .select('fcm_token')
    .eq('user_id', user.id)
    .single();

  if (!funcionario?.fcm_token) {
    return { enabled: false, reason: 'Token FCM não registrado' };
  }

  return { enabled: true };
} 
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders
      });
    }

    const requestData = await req.json();
    const body = requestData.body || requestData;
    
    if (!body) {
      return new Response(JSON.stringify({ 
        error: 'Request body is missing or invalid',
        received: requestData
      }), { 
        status: 400,
        headers: corsHeaders
      });
    }
    
    const { type, userId, taskId, title } = body;

    if (!type || !userId) {
      return new Response('Missing required parameters: type, userId', { 
        status: 400,
        headers: corsHeaders
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables not configured");
    }

    if (!serviceAccountJson) {
      throw new Error("Secret 'FIREBASE_SERVICE_ACCOUNT_JSON' is not set in Supabase project settings.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: funcionario, error: userError } = await supabaseAdmin
      .from('funcionarios')
      .select('fcm_token, nome')
      .eq('user_id', userId)
      .single();

    if (userError || !funcionario) {
      return new Response(JSON.stringify({ 
        error: `User not found for userId: ${userId}`,
        details: userError
      }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const fcmToken = funcionario.fcm_token || 'test-fcm-token-123456789';

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (parseError) {
      throw new Error(`Invalid Service Account JSON: ${parseError.message}`);
    }

    let notificationTitle = 'Nova Tarefa';
    let notificationBody = `A tarefa '${title}' foi atribuída a você.`;

    switch (type) {
      case 'task_assigned':
        notificationTitle = 'Nova Tarefa Atribuída';
        notificationBody = `'${title || 'Uma nova tarefa'}' foi atribuída a você.`;
        break;
      case 'task_due_soon':
        notificationTitle = 'Tarefa Vence em Breve';
        notificationBody = `'${title || 'Uma tarefa'}' vence em breve.`;
        break;
      case 'task_overdue':
        notificationTitle = 'Tarefa em Atraso';
        notificationBody = `'${title || 'Uma tarefa'}' está atrasada.`;
        break;
      case 'task_completed':
        notificationTitle = 'Tarefa Concluída';
        notificationBody = `'${title || 'Uma tarefa'}' foi marcada como concluída.`;
        break;
    }

    const { data: notificationData, error: insertError } = await supabaseAdmin
      .from('notificacoes')
      .insert({
        user_id: userId,
        tipo: type,
        titulo: notificationTitle,
        mensagem: notificationBody,
        task_id: taskId,
        enviada_em: new Date().toISOString(),
        status: 'enviada'
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save notification: ${insertError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Notification saved for user ${funcionario.nome}`,
      notification: notificationData,
      debug: {
        hasServiceAccount: !!serviceAccount,
        hasFcmToken: !!fcmToken,
        projectId: serviceAccount.project_id
      }
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    // Manter um log de erro crítico é importante
    console.error('CRITICAL_ERROR in send-notification:', {
      message: error.message,
      stack: error.stack
    });
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

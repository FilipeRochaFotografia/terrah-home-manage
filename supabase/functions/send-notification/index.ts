import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleAuth } from 'https://deno.land/x/gcp_auth@v0.3.0/mod.ts';

console.log("Edge function 'send-notification' is running.");

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { body } = await req.json();
    const { type, userId, taskId, title } = body;

    if (!type || !userId) {
      return new Response('Missing required parameters: type, userId', { status: 400 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: funcionario, error: userError } = await supabaseAdmin
      .from('funcionarios')
      .select('fcm_token, nome')
      .eq('user_id', userId)
      .single();

    if (userError || !funcionario || !funcionario.fcm_token) {
      console.error('FCM token not found for user:', userId, userError);
      return new Response(JSON.stringify({ error: `User or FCM token not found for userId: ${userId}` }), { status: 404 });
    }
    const fcmToken = funcionario.fcm_token;
    console.log(`FCM Token found for user ${funcionario.nome}.`);

    const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      throw new Error("Secret 'FIREBASE_SERVICE_ACCOUNT_JSON' is not set in Supabase project settings.");
    }
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    const auth = new GoogleAuth({
      keyFile: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });
    const accessToken = await auth.getAccessToken();
    console.log("Successfully obtained Firebase access token.");

    let notificationTitle = 'Nova Tarefa';
    let notificationBody = `A tarefa '${title}' foi atribuída a você.`;

    switch (type) {
      case 'task_assigned':
        notificationTitle = '📋 Nova Tarefa Atribuída';
        notificationBody = `'${title || 'Uma nova tarefa'}' foi atribuída a você.`;
        break;
      case 'task_due_soon':
        notificationTitle = '⏰ Tarefa Vence em Breve';
        notificationBody = `'${title || 'Uma tarefa'}' vence em breve.`;
        break;
      case 'task_overdue':
        notificationTitle = '🚨 Tarefa em Atraso';
        notificationBody = `'${title || 'Uma tarefa'}' está atrasada.`;
        break;
      case 'task_completed':
        notificationTitle = '✅ Tarefa Concluída';
        notificationBody = `'${title || 'Uma tarefa'}' foi marcada como concluída.`;
        break;
    }
    
    const fcmMessage = {
      message: {
        token: fcmToken,
        notification: {
          title: notificationTitle,
          body: notificationBody,
        },
        data: {
          type: type,
          taskId: taskId || '',
        },
        webpush: {
          notification: {
            title: notificationTitle,
            body: notificationBody,
            icon: '/lovable-uploads/logo.png',
            badge: '/lovable-uploads/logo.png',
          },
          fcm_options: {
            link: `/?taskId=${taskId || ''}`
          }
        },
      },
    };

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fcmMessage),
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("FCM API Error:", errorText);
        throw new Error(`FCM request failed with status ${response.status}: ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log("Notification sent successfully via FCM:", responseData);
    
    return new Response(JSON.stringify({ success: true, result: responseData }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Critical error in Edge Function:', error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});

// Importa o script do Firebase Messaging
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDs2LtyvA5Sku9uJASSXrCVtbwxvBOmYqc",
  authDomain: "terrah-homes.firebaseapp.com",
  projectId: "terrah-homes",
  storageBucket: "terrah-homes.firebasestorage.app",
  messagingSenderId: "1048144850400",
  appId: "1:1048144850400:web:f148dbe3f32f4013344f85",
  measurementId: "G-2Z9H6SG456"
};

try {
  // Inicializa o Firebase apenas se ainda não foi inicializado
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Obtém uma instância do Messaging
  const messaging = firebase.messaging();

  // Adiciona um listener para quando uma notificação é recebida em segundo plano
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Customiza a notificação que será exibida
    const notificationTitle = payload.notification?.title || 'Nova Notificação';
    const notificationOptions = {
      body: payload.notification?.body || 'Você tem uma nova notificação',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'terrah-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'Ver'
        },
        {
          action: 'dismiss',
          title: 'Dispensar'
        }
      ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });

  // Listener para cliques na notificação
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
      // Abrir ou focar na janela da aplicação
      event.waitUntil(
        clients.matchAll().then((clientList) => {
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
      );
    }
  });

} catch (error) {
  console.error('Erro ao inicializar Firebase no service worker:', error);
} 
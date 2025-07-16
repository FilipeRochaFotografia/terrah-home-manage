import { initializeApp, getApp, getApps } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

// Extraia os valores do objeto que você forneceu
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicialize o Firebase de forma segura (evita reinicialização)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const messaging = getMessaging(app);

export { app, messaging }; 
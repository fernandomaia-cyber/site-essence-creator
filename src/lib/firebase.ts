import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getStorage, FirebaseStorage, connectStorageEmulator } from "firebase/storage";

// Validar variáveis de ambiente obrigatórias
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kappi-onboard-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Verificar se as variáveis obrigatórias estão definidas
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value && key !== 'projectId')
  .map(([key]) => `VITE_FIREBASE_${key.toUpperCase()}`);

if (missingVars.length > 0) {
  console.error(
    `❌ Variáveis de ambiente do Firebase não configuradas:\n` +
    `   ${missingVars.join(', ')}\n\n` +
    `📝 Crie um arquivo .env.local na pasta apps/clients/portal_dot/ com:\n` +
    `   VITE_FIREBASE_API_KEY=your-api-key\n` +
    `   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain\n` +
    `   VITE_FIREBASE_PROJECT_ID=kappi-onboard-app\n` +
    `   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket\n` +
    `   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id\n` +
    `   VITE_FIREBASE_APP_ID=your-app-id\n\n` +
    `💡 Você pode encontrar essas informações no Console do Firebase: https://console.firebase.google.com/`
  );
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey,
  authDomain: requiredEnvVars.authDomain,
  projectId: requiredEnvVars.projectId,
  storageBucket: requiredEnvVars.storageBucket,
  messagingSenderId: requiredEnvVars.messagingSenderId,
  appId: requiredEnvVars.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error: any) {
    console.error('Erro ao inicializar Firebase:', error);
    if (error.code === 'auth/api-key-not-valid') {
      throw new Error(
        'API Key do Firebase inválida. Verifique se as variáveis de ambiente estão configuradas corretamente.\n' +
        'Crie um arquivo .env.local na pasta apps/clients/portal_dot/ com as credenciais do Firebase.'
      );
    }
    throw error;
  }
} else {
  app = getApps()[0];
}

// Initialize Firestore
export const db: Firestore = getFirestore(app);

// Initialize Auth
export const auth: Auth = getAuth(app);

// Initialize Storage
export const storage: FirebaseStorage = getStorage(app);

// Conectar ao emulador em desenvolvimento (se estiver rodando)
// Use a variável de ambiente para controlar se deve usar o emulador
const useEmulator = import.meta.env.VITE_USE_FIRESTORE_EMULATOR === 'true';

if (import.meta.env.DEV && useEmulator) {
  try {
    // Verifica se já está conectado ao emulador
    const settings = (db as any)._delegate?._settings;
    if (!settings?.host?.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('Conectado ao Firestore Emulator em localhost:8080');
    }
  } catch (error) {
    // Emulador já conectado ou não disponível
    console.log('Firestore emulator:', error instanceof Error ? error.message : 'já conectado ou não disponível');
  }

  // Conectar Auth Emulator
  try {
    if (!(auth as any)._delegate?._config?.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099');
      console.log('Conectado ao Auth Emulator em localhost:9099');
    }
  } catch (error) {
    console.log('Auth emulator:', error instanceof Error ? error.message : 'já conectado ou não disponível');
  }

  // Conectar Storage Emulator
  try {
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('Conectado ao Storage Emulator em localhost:9199');
  } catch (error) {
    console.log('Storage emulator:', error instanceof Error ? error.message : 'já conectado ou não disponível');
  }
}

export default app;


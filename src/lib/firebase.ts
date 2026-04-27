import {
  initializeApp,
  getApps,
  FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getStorage, FirebaseStorage, connectStorageEmulator } from "firebase/storage";

/** Tenant do Google Cloud Identity Platform (Auth multi-tenant) para o portal Dot. */
const AUTH_TENANT_ID = "dotgroup-nuhew";

function configFromEnv(): FirebaseOptions {
  const requiredEnvVars = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kappi-onboard-app",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const envName: Record<string, string> = {
    apiKey: "VITE_FIREBASE_API_KEY",
    authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
    projectId: "VITE_FIREBASE_PROJECT_ID",
    storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
    appId: "VITE_FIREBASE_APP_ID",
  };
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value && key !== "projectId")
    .map(([key]) => envName[key] ?? key);

  if (missingVars.length > 0) {
    console.error(
      `❌ Variáveis de ambiente do Firebase não configuradas:\n` +
        `   ${missingVars.join(", ")}\n\n` +
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

  return {
    apiKey: requiredEnvVars.apiKey,
    authDomain: requiredEnvVars.authDomain,
    projectId: requiredEnvVars.projectId,
    storageBucket: requiredEnvVars.storageBucket,
    messagingSenderId: requiredEnvVars.messagingSenderId,
    appId: requiredEnvVars.appId,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };
}

async function loadFirebaseConfig(): Promise<FirebaseOptions> {
  if (import.meta.env.DEV) {
    return configFromEnv();
  }

  const res = await fetch("/__/firebase/init.json");
  if (!res.ok) {
    throw new Error(
      `Falha ao carregar /__/firebase/init.json (HTTP ${res.status}). ` +
        "Em produção o app precisa ser servido pelo Firebase Hosting (ou firebase serve) para essa URL existir."
    );
  }
  return res.json() as Promise<FirebaseOptions>;
}

export let app: FirebaseApp;
export let db: Firestore;
export let auth: Auth;
export let storage: FirebaseStorage;

let initPromise: Promise<void> | null = null;

export function initFirebase(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const firebaseConfig = await loadFirebaseConfig();

    if (getApps().length === 0) {
      try {
        app = initializeApp(firebaseConfig);
      } catch (error: unknown) {
        console.error("Erro ao inicializar Firebase:", error);
        const code =
          error && typeof error === "object" && "code" in error
            ? (error as { code?: string }).code
            : undefined;
        if (code === "auth/api-key-not-valid") {
          throw new Error(
            "API Key do Firebase inválida. Em desenvolvimento, verifique o .env.local; em produção, confira o app Web no Firebase Console e o Hosting."
          );
        }
        throw error;
      }
    } else {
      app = getApps()[0];
    }

    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    const useEmulator = import.meta.env.VITE_USE_FIRESTORE_EMULATOR === "true";

    if (!(import.meta.env.DEV && useEmulator)) {
      auth.tenantId = AUTH_TENANT_ID;
    }

    if (import.meta.env.DEV && useEmulator) {
      try {
        const settings = (db as { _delegate?: { _settings?: { host?: string } } })._delegate
          ?._settings;
        if (!settings?.host?.includes("localhost")) {
          connectFirestoreEmulator(db, "localhost", 8080);
          console.log("Conectado ao Firestore Emulator em localhost:8080");
        }
      } catch (error) {
        console.log(
          "Firestore emulator:",
          error instanceof Error ? error.message : "já conectado ou não disponível"
        );
      }

      try {
        const authDelegate = (auth as { _delegate?: { _config?: { emulator?: unknown } } })
          ._delegate;
        if (!authDelegate?._config?.emulator) {
          connectAuthEmulator(auth, "http://localhost:9099");
          console.log("Conectado ao Auth Emulator em localhost:9099");
        }
      } catch (error) {
        console.log(
          "Auth emulator:",
          error instanceof Error ? error.message : "já conectado ou não disponível"
        );
      }

      try {
        connectStorageEmulator(storage, "localhost", 9199);
        console.log("Conectado ao Storage Emulator em localhost:9199");
      } catch (error) {
        console.log(
          "Storage emulator:",
          error instanceof Error ? error.message : "já conectado ou não disponível"
        );
      }
    }
  })();

  return initPromise;
}

// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);

// Persistent local cache means onSnapshot listeners re-hydrate from disk
// instantly on page load/reconnect (e.g. the last known liveLocation),
// instead of waiting on a fresh network round-trip every time.
function initDb() {
  if (typeof window === "undefined") {
    // Server-side render — no IndexedDB available, fall back to the default.
    return getFirestore(app);
  }
  try {
    // Single-tab persistence only — the multi-tab manager coordinates the
    // offline mutation queue across tabs via IndexedDB, which is where a
    // known class of "already exists" replay errors comes from when a
    // fire-and-forget write (e.g. an audit log entry) races a tab
    // switch/navigation. Most users don't have this app open in two tabs
    // at once, so it's not worth that complexity/risk.
    return initializeFirestore(app, {
      localCache: persistentLocalCache(),
    });
  } catch {
    // Firestore was already initialized elsewhere in this session (e.g. Fast
    // Refresh re-running this module) — reuse the existing instance instead
    // of throwing.
    return getFirestore(app);
  }
}

export const db = initDb();
export default app;
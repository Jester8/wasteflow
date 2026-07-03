import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export type AdminLogType =
  | "user_signup"
  | "login"
  | "status_change"
  | "admin_action";

interface LogAdminEventInput {
  type: AdminLogType;
  message: string;
  targetId?: string;
  meta?: Record<string, any>;
}

/**
 * Writes an entry to the adminLogs audit trail. Always logs as the
 * currently signed-in user (Firestore rules reject any actorId other than
 * request.auth.uid), so this can only ever record the caller's own action —
 * never someone else's.
 *
 * Fire-and-forget by design: a failed log write should never block the
 * action it's describing.
 */
export function logAdminEvent({ type, message, targetId, meta }: LogAdminEventInput) {
  const user = auth.currentUser;
  if (!user) return;

  addDoc(collection(db, "adminLogs"), {
    type,
    message,
    actorId: user.uid,
    actorEmail: user.email || null,
    targetId: targetId || null,
    meta: meta || null,
    createdAt: serverTimestamp(),
  }).catch((err) => {
    console.error("[adminLog] Failed to write log entry:", err);
  });
}

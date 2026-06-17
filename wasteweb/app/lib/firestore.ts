import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── Create user profile on signup ─────────────────────────────────────────────
export async function saveUserProfile(
  uid: string,
  data: {
    role: "operator" | "contractor";
    fullName: string;
    email: string;
    provider?: "email" | "google";
  }
) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    uid,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    kycStatus: "pending",
    provider: data.provider ?? "email",
    emailVerified: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ── Read user profile ─────────────────────────────────────────────────────────
export async function getUserProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) return { uid, ...snap.data() };
  return null;
}

// ── Submit KYC ────────────────────────────────────────────────────────────────
// Calls the Next.js API route which uses the Admin SDK server-side,
// bypassing Firestore rules to write kycStatus = 'submitted'
export async function updateUserKYC(uid: string, kycData: Record<string, any>) {
  const res = await fetch("/api/kyc/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, kycData }),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "KYC submission failed" }));
    throw new Error(error ?? "KYC submission failed");
  }
}

// ── Read KYC submission ───────────────────────────────────────────────────────
export async function getKycSubmission(uid: string) {
  const kycRef = doc(db, "kyc", uid);
  const snap = await getDoc(kycRef);
  if (snap.exists()) return snap.data();
  return null;
}
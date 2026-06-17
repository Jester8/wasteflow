import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── Create user profile on signup ─────────────────────────────────────────────
// Writes to /users/{uid} — kycStatus must be 'pending' to satisfy rules
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
    kycStatus: "pending",          // always starts as pending — rules enforce this
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
// Writes to /kyc/{uid} — NOT /users/{uid}
// A Cloud Function listening to /kyc/{uid} onCreate will set
// kycStatus = 'submitted' on /users/{uid} via the Admin SDK
export async function updateUserKYC(uid: string, kycData: Record<string, any>) {
  const kycRef = doc(db, "kyc", uid);
  await setDoc(kycRef, {
    ...kycData,
    uid,
    submittedAt: serverTimestamp(),
  });
  // ⚠️ Do NOT touch /users/{uid} here — kycStatus is set server-side only
}

// ── Read KYC submission ───────────────────────────────────────────────────────
export async function getKycSubmission(uid: string) {
  const kycRef = doc(db, "kyc", uid);
  const snap = await getDoc(kycRef);
  if (snap.exists()) return snap.data();
  return null;
}
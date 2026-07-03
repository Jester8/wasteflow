import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logAdminEvent } from "@/app/lib/adminLog";

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
    accountStatus: "active",
    provider: data.provider ?? "email",
    emailVerified: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  logAdminEvent({
    type: "user_signup",
    message: `${data.fullName} signed up as ${data.role}`,
    targetId: uid,
    meta: { role: data.role, email: data.email },
  });
}

export async function getUserProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) return { uid, ...snap.data() };
  return null;
}

export async function updateUserKYC(uid: string, kycData: Record<string, any>) {
  const kycRef = doc(db, "kyc", uid);
  await setDoc(kycRef, {
    ...kycData,
    uid,
    submittedAt: serverTimestamp(),
  });
}

export async function getKycSubmission(uid: string) {
  const kycRef = doc(db, "kyc", uid);
  const snap = await getDoc(kycRef);
  if (snap.exists()) return snap.data();
  return null;
}

export async function markKycSubmitted(uid: string) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    kycStatus: "submitted",
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
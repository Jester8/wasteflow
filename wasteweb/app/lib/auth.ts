import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveUserProfile, getUserProfile } from "@/lib/firestore";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // ✅ Check if profile already exists before writing
    const existing = await getUserProfile(user.uid);

    if (!existing) {
      // First time — create the profile
      // Google sign-in has no role context, so send them to a role-picker
      // OR default to a role — your signup flow should handle this properly
      await saveUserProfile(user.uid, {
        fullName: user.displayName ?? "",
        email: user.email ?? "",
        role: "contractor", // fallback — see note below
        provider: "google",
      });
    }
    // If profile exists, do nothing — preserve kycStatus as-is

    return { success: true };
  } catch (err: any) {
    return { success: false, error: friendlyAuthError(err.code) };
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: friendlyAuthError(err.code) };
  }
}

function friendlyAuthError(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential": return "Invalid email or password.";
    case "auth/too-many-requests":  return "Too many attempts. Please try again later.";
    case "auth/user-disabled":      return "This account has been disabled.";
    case "auth/popup-closed-by-user": return "Sign-in cancelled.";
    default: return "Sign in failed. Please try again.";
  }
}
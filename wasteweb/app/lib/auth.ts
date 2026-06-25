import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";

const googleProvider = new GoogleAuthProvider();

// ── Google — used by both signup and login ────────────────────────────────────
// Returns isNewUser: true if no profile existed yet (signup flow)
// Returns isNewUser: false if profile already existed (login flow)
// Does NOT write any profile — that's the caller's responsibility
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const existing = await getUserProfile(user.uid);
    const isNewUser = !existing;

    return {
      success: true,
      isNewUser,
      uid: user.uid,
    };
  } catch (err: any) {
    if (err.code === "auth/popup-closed-by-user") {
      return { success: false, error: null }; // silent cancel
    }
    return { success: false, error: friendlyAuthError(err.code) };
  }
}

// ── Email signup ──────────────────────────────────────────────────────────────
export async function signUp(email: string, password: string, fullName: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: fullName });
    return { success: true, uid: result.user.uid };
  } catch (err: any) {
    return { success: false, error: friendlyAuthError(err.code) };
  }
}

// ── Email login ───────────────────────────────────────────────────────────────
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
      return "No account found with this email.";

    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";

    case "auth/email-already-in-use":
      return "An account with this email already exists.";

    case "auth/weak-password":
      return "Password must be at least 6 characters.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/popup-closed-by-user":
      return "Sign-in cancelled.";

    default:
      return "Sign in failed. Please try again.";
  }
}
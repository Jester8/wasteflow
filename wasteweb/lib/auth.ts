import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  getAdditionalUserInfo,
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export async function signUp(email: string, password: string, fullName: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: fullName });
    return { success: true, uid: userCredential.user.uid, error: null };
  } catch (error: any) {
    return { success: false, uid: null, error: friendlyError(error.code) };
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user, error: null };
  } catch (error: any) {
    return { success: false, user: null, error: friendlyError(error.code) };
  }
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const additionalInfo = getAdditionalUserInfo(result);
    return {
      success: true,
      uid: result.user.uid,
      isNewUser: additionalInfo?.isNewUser ?? false,
      error: null,
    };
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      return { success: false, uid: null, isNewUser: false, error: null };
    }
    return { success: false, uid: null, isNewUser: false, error: friendlyError(error.code) };
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: friendlyError(error.code) };
  }
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 8 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export { auth };
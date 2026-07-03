"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { onSnapshot, doc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

type AuthContextType = {
  user: User | null;
  profile: any | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        profileUnsub = onSnapshot(
          userRef,
          (snap) => {
            const data = snap.exists() ? snap.data() : null;

            // A suspended account gets signed out immediately, wherever in
            // the app they are — the existing auth-only guards then take
            // care of redirecting them to /login since `user` becomes null.
            if (data?.accountStatus === "suspended") {
              signOut(auth);
              setProfile(null);
              setLoading(false);
              return;
            }

            setProfile(data ? { uid: snap.id, ...data } : null);
            setLoading(false);
          },
          () => {
            setProfile(null);
            setLoading(false);
          }
        );
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const { getUserProfile } = await import("../../lib/firestore");
    const fresh = await getUserProfile(user.uid);
    setProfile(fresh);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
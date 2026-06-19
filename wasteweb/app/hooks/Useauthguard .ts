"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

type GuardType = "guest-only" | "auth-only" | "kyc-complete";

export function useAuthGuard(type: GuardType) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (type === "guest-only") {
      if (user && profile) {
        if (!profile.kycStatus) {
          router.replace("/kyc");
        } else {
          router.replace(profile.role === "operator" ? "/operators/" : "/contractor/");
        }
      }
      return;
    }

    if (type === "auth-only" || type === "kyc-complete") {
      if (!user) {
        router.replace("/login");
        return;
      }
    }

    if (type === "kyc-complete") {
      if (profile && !profile.kycStatus) {
        router.replace("/kyc");
        return;
      }
    }
  }, [user, profile, loading, router, type]);

  return { user, profile, loading };
}
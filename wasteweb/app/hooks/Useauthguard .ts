"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

type GuardType = "guest-only" | "auth-only" | "kyc-complete";
type Role = "operator" | "contractor" | "operatorAdmin" | "contractorAdmin";

function dashboardPathFor(role: string) {
  if (role === "operator") return "/operators/";
  if (role === "operatorAdmin") return "/operator-admin/";
  if (role === "contractorAdmin") return "/contractor-admin/";
  return "/contractor/";
}

export function useAuthGuard(type: GuardType, requiredRole?: Role) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (type === "guest-only") {
      if (user && profile) {
        if (!profile.kycStatus) {
          router.replace("/kyc");
        } else {
          router.replace(dashboardPathFor(profile.role));
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

    if (requiredRole && profile && profile.role !== requiredRole) {
      router.replace(dashboardPathFor(profile.role));
      return;
    }
  }, [user, profile, loading, router, type, requiredRole]);

  return { user, profile, loading };
}
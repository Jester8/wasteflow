"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { signOut as firebaseSignOut } from "@/lib/auth";
import SuperAdminSidebar from "./components/SuperAdminSidebar";
import SuperAdminSignIn from "./components/SuperAdminSignIn";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const [wrongRole, setWrongRole] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user && profile && profile.role !== "superadmin") {
      setWrongRole(true);
      firebaseSignOut();
    }
  }, [user, profile, loading]);

  if (loading || (user && !profile)) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0d2416",
      }}>
        <style>{`@keyframes saSpin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          border: "3px solid rgba(184,213,46,0.25)", borderTopColor: "#B8D52E",
          animation: "saSpin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  if (!user || !profile || profile.role !== "superadmin") {
    return <SuperAdminSignIn wrongRoleError={wrongRole} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f9f5", fontFamily: "'Quicksand', sans-serif" }}>
      <SuperAdminSidebar />
      <main style={{ flex: 1, padding: "32px 40px", minWidth: 0 }}>{children}</main>
    </div>
  );
}

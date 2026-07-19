"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { signOut as firebaseSignOut } from "@/lib/auth";
import ContractorAdminSignIn from "./components/ContractorAdminSignIn";

export default function ContractorAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const [wrongRole, setWrongRole] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user && profile && profile.role !== "contractorAdmin") {
      setWrongRole(true);
      firebaseSignOut();
    }
  }, [user, profile, loading]);

  if (loading || (user && !profile)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f9f5" }}>
        <style>{`@keyframes caSpin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          border: "3px solid rgba(184,213,46,0.35)", borderTopColor: "#1a4d2e",
          animation: "caSpin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  if (!user || !profile || profile.role !== "contractorAdmin") {
    return <ContractorAdminSignIn wrongRoleError={wrongRole} />;
  }

  async function handleSignOut() {
    await firebaseSignOut();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f9f5", fontFamily: "'Quicksand', sans-serif" }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(245,250,246,0.92)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e8f2eb", padding: "0 20px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#3a6b00", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
            WasteFlow
          </p>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>
            Contractor Admin
          </p>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            padding: "8px 14px", borderRadius: 9, border: "1px solid #e8f2eb",
            background: "#ffffff", color: "#4a7a5a", fontSize: "0.78rem", fontWeight: 700,
            cursor: "pointer", fontFamily: "'Quicksand', sans-serif",
          }}
        >
          Sign out
        </button>
      </div>

      <div style={{ padding: "24px 20px", maxWidth: 1000, margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}

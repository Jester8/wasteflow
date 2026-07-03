"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { signOut as firebaseSignOut } from "@/lib/auth";
import SuperAdminSidebar from "./components/SuperAdminSidebar";
import SuperAdminSignIn from "./components/SuperAdminSignIn";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const [wrongRole, setWrongRole] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <style>{`
        .sa-main { flex: 1; min-width: 0; }
        .sa-topbar { display: none; }
        @media (max-width: 1023px) {
          .sa-topbar {
            position: sticky; top: 0; z-index: 10;
            background: rgba(245,250,246,0.92); backdrop-filter: blur(10px);
            border-bottom: 1px solid #e8f2eb;
            padding: 0 20px; height: 56px;
            display: flex; align-items: center; gap: 12px;
          }
          .sa-content { padding: 20px !important; }
        }
        .sa-hamburger {
          background: none; border: none; cursor: pointer;
          color: #1a4d2e; padding: 6px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.18s; flex-shrink: 0;
        }
        .sa-hamburger:hover { background: rgba(184,213,46,0.12); }
      `}</style>

      <SuperAdminSidebar
        collapsed={collapsed}
        onCollapse={() => setCollapsed(true)}
        onExpand={() => setCollapsed(false)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="sa-main">
        <div className="sa-topbar">
          <button
            className="sa-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2e1f" }}>Super Admin</span>
        </div>

        <div className="sa-content" style={{ padding: "32px 40px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}

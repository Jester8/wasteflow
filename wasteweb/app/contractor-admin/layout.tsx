"use client";

import { useState } from "react";
import { useAuthGuard } from "../hooks/Useauthguard ";
import ContractorAdminSidebar from "./components/ContractorAdminSidebar";

export default function ContractorAdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuthGuard("kyc-complete", "contractorAdmin");
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading || !profile) {
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f9f5", fontFamily: "'Quicksand', sans-serif" }}>
      <style>{`
        .ca-main { flex: 1; min-width: 0; }
        .ca-topbar { display: none; }
        @media (max-width: 1023px) {
          .ca-topbar {
            position: sticky; top: 0; z-index: 10;
            background: rgba(245,250,246,0.92); backdrop-filter: blur(10px);
            border-bottom: 1px solid #e8f2eb;
            padding: 0 20px; height: 56px;
            display: flex; align-items: center; gap: 12px;
          }
          .ca-content { padding: 20px !important; }
        }
        .ca-hamburger {
          background: none; border: none; cursor: pointer;
          color: #1a4d2e; padding: 6px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.18s; flex-shrink: 0;
        }
        .ca-hamburger:hover { background: rgba(184,213,46,0.12); }
      `}</style>

      <ContractorAdminSidebar
        collapsed={collapsed}
        onCollapse={() => setCollapsed(true)}
        onExpand={() => setCollapsed(false)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="ca-main">
        <div className="ca-topbar">
          <button
            className="ca-hamburger"
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
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2e1f" }}>Contractor Admin</span>
        </div>

        <div className="ca-content" style={{ padding: "32px 40px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}

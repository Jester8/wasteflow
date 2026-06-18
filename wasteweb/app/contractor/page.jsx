"use client";

import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./sidebar";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent = false }) {
  return (
    <div style={{
      background: accent ? "#1a4d2e" : "#ffffff",
      border: `1px solid ${accent ? "rgba(184,213,46,0.2)" : "#e8f2eb"}`,
      borderRadius: 14, padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: 12,
      boxShadow: accent ? "0 4px 20px rgba(26,77,46,0.15)" : "0 1px 4px rgba(0,0,0,0.05)",
      position: "relative", overflow: "hidden",
      fontFamily: "'Quicksand', sans-serif",
    }}>
      {accent && (
        <div style={{
          position: "absolute", top: -30, right: -30,
          width: 120, height: 120, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(184,213,46,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: "0.72rem", fontWeight: 700,
          color: accent ? "#6aaa7a" : "#8aab97",
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>{label}</span>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: accent ? "rgba(184,213,46,0.12)" : "#f0f7f2",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: accent ? "#B8D52E" : "#1a4d2e",
        }}>{icon}</div>
      </div>
      <div>
        <div style={{
          fontSize: "1.8rem", fontWeight: 700,
          color: accent ? "#e8f5ee" : "#1a2e1f",
          lineHeight: 1, letterSpacing: "-0.02em",
        }}>{value}</div>
        {sub && (
          <div style={{
            fontSize: "0.72rem", fontWeight: 600,
            color: accent ? "#4a8a5a" : "#9ab8a5", marginTop: 5,
          }}>{sub}</div>
        )}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Pending:   { bg: "rgba(184,213,46,0.12)", color: "#5a8a1a", border: "rgba(184,213,46,0.3)" },
  Approved:  { bg: "rgba(26,77,46,0.08)",   color: "#1a4d2e", border: "rgba(26,77,46,0.2)"  },
  Collected: { bg: "rgba(59,130,246,0.08)", color: "#2563eb", border: "rgba(59,130,246,0.2)" },
  Rejected:  { bg: "rgba(224,92,92,0.08)",  color: "#c0392b", border: "rgba(224,92,92,0.2)" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span style={{
      fontSize: "0.68rem", fontWeight: 700,
      padding: "3px 10px", borderRadius: 999,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      fontFamily: "'Quicksand', sans-serif",
      letterSpacing: "0.02em", whiteSpace: "nowrap",
    }}>{status}</span>
  );
}

const KYC_BADGE_STYLES = {
  pending:   { bg: "rgba(184,213,46,0.12)", color: "#5a8a1a", border: "rgba(184,213,46,0.3)", label: "KYC Pending" },
  submitted: { bg: "rgba(59,130,246,0.08)", color: "#2563eb", border: "rgba(59,130,246,0.2)", label: "Under Review" },
  approved:  { bg: "rgba(26,77,46,0.08)",   color: "#1a4d2e", border: "rgba(26,77,46,0.2)",  label: "Verified" },
  rejected:  { bg: "rgba(224,92,92,0.08)",  color: "#c0392b", border: "rgba(224,92,92,0.2)", label: "Rejected" },
};

function KycStatusBadge({ status }) {
  const s = KYC_BADGE_STYLES[status] || KYC_BADGE_STYLES.pending;
  return (
    <span style={{
      fontSize: "0.7rem", fontWeight: 700,
      padding: "4px 12px", borderRadius: 999,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      fontFamily: "'Quicksand', sans-serif",
      letterSpacing: "0.02em", whiteSpace: "nowrap",
      display: "inline-flex", alignItems: "center",
    }}>{s.label}</span>
  );
}

const MOCK_REQUESTS = [];

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const { user, profile } = useAuth();

  const displayName = profile?.fullName || user?.email?.split("@")[0] || "Operator";
  const displayEmail = profile?.email || user?.email || "";
  const kycStatus = profile?.kycStatus || "pending";

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
      setSigningOut(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wf-admin-root {
          display: flex;
          min-height: 100vh;
          background: #f5faf6;
          font-family: 'Quicksand', sans-serif;
        }

        .wf-admin-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow-y: auto;
        }

        /* Topbar */
        .wf-topbar {
          position: sticky; top: 0; z-index: 10;
          background: rgba(245,250,246,0.92);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #e8f2eb;
          padding: 0 28px; height: 60px;
          display: flex; align-items: center;
          justify-content: space-between; flex-shrink: 0;
        }

        .wf-topbar-left {
          display: flex; align-items: center; gap: 14px;
        }

        /* Hamburger — only on mobile */
        .wf-hamburger {
          display: none;
          background: none; border: none; cursor: pointer;
          color: #1a4d2e; padding: 6px; border-radius: 8px;
          align-items: center; justify-content: center;
          transition: background 0.18s;
          flex-shrink: 0;
        }
        .wf-hamburger:hover { background: rgba(184,213,46,0.12); }

        .wf-topbar-title {
          font-size: 1rem; font-weight: 700;
          color: #1a2e1f; font-family: 'Quicksand', sans-serif;
        }

        .wf-topbar-right {
          display: flex; align-items: center; gap: 10px;
        }

        .wf-topbar-date {
          font-size: 0.75rem; color: #8aab97;
          font-weight: 600; font-family: 'Quicksand', sans-serif;
        }

        .wf-notif-btn {
          width: 34px; height: 34px; border-radius: 9px;
          background: #ffffff; border: 1px solid #e8f2eb;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #4a7a5a; position: relative;
          transition: border 0.18s, color 0.18s;
        }
        .wf-notif-btn:hover { border-color: #B8D52E; color: #1a4d2e; }

        .wf-notif-dot {
          position: absolute; top: 7px; right: 7px;
          width: 7px; height: 7px; border-radius: 50%;
          background: #B8D52E; border: 1.5px solid #f5faf6;
        }

        /* Content */
        .wf-content {
          padding: 28px;
          display: flex; flex-direction: column; gap: 28px;
        }

        .wf-greeting h1 {
          font-size: clamp(1.2rem, 2vw, 1.5rem); font-weight: 700;
          color: #1a2e1f; letter-spacing: -0.02em; margin-bottom: 4px;
          font-family: 'Quicksand', sans-serif;
        }
        .wf-greeting p {
          font-size: 0.875rem; color: #6b8f7a;
          font-weight: 600; font-family: 'Quicksand', sans-serif;
        }

        .wf-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (min-width: 900px) {
          .wf-stats-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .wf-table-card {
          background: #ffffff; border: 1px solid #e8f2eb;
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .wf-table-header {
          padding: 18px 22px 14px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #f0f7f2;
        }

        .wf-table-title {
          font-size: 0.9rem; font-weight: 700;
          color: #1a2e1f; font-family: 'Quicksand', sans-serif;
        }

        .wf-view-all {
          font-size: 0.75rem; font-weight: 700; color: #1a4d2e;
          text-decoration: none; font-family: 'Quicksand', sans-serif;
          display: flex; align-items: center; gap: 4px;
          transition: color 0.18s;
        }
        .wf-view-all:hover { color: #B8D52E; }

        .wf-table-wrap { overflow-x: auto; }

        table { width: 100%; border-collapse: collapse; }

        thead th {
          padding: 11px 18px; text-align: left;
          font-size: 0.68rem; font-weight: 700; color: #8aab97;
          text-transform: uppercase; letter-spacing: 0.08em;
          font-family: 'Quicksand', sans-serif;
          background: #fafcfa; border-bottom: 1px solid #f0f7f2;
          white-space: nowrap;
        }

        tbody tr { border-bottom: 1px solid #f5faf6; transition: background 0.15s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: #fafcfa; }

        tbody td {
          padding: 13px 18px; font-size: 0.82rem; font-weight: 600;
          color: #2a4a35; font-family: 'Quicksand', sans-serif; white-space: nowrap;
        }

        .wf-id-cell {
          font-size: 0.72rem; color: #8aab97; font-weight: 700;
          font-family: 'Quicksand', sans-serif; letter-spacing: 0.04em;
        }

        .wf-action-btn {
          background: none; border: 1px solid #e8f2eb; border-radius: 7px;
          padding: 5px 12px; font-size: 0.72rem; font-weight: 700;
          color: #1a4d2e; cursor: pointer; font-family: 'Quicksand', sans-serif;
          transition: background 0.18s, border 0.18s, color 0.18s;
        }
        .wf-action-btn:hover { background: #1a4d2e; border-color: #1a4d2e; color: #e8f5ee; }

        /* Mobile */
        @media (max-width: 768px) {
          .wf-hamburger { display: flex; }
          .wf-topbar { padding: 0 16px; }
          .wf-topbar-date { display: none; }
          .wf-content { padding: 16px; gap: 16px; }
        }
      `}</style>

      <div className="wf-admin-root">
        <Sidebar
          adminEmail={displayEmail}
          adminName={displayName}
          onSignOut={handleSignOut}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(true)}
          onExpand={() => setCollapsed(false)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="wf-admin-main">
          <div className="wf-topbar">
            <div className="wf-topbar-left">
              {/* Hamburger — triggers mobile drawer */}
              <button
                className="wf-hamburger"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <span className="wf-topbar-title">Contractor Dashboard</span>
            </div>
            <div className="wf-topbar-right">
              <span className="wf-topbar-date">
                {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </span>
              <button className="wf-notif-btn" aria-label="Notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span className="wf-notif-dot" />
              </button>
            </div>
          </div>

          <div className="wf-content">
            <div className="wf-greeting" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <h1>Good morning, {displayName.split(" ")[0]} 👋</h1>
                <p>Here's what's happening on WasteFlow today.</p>
              </div>
              <KycStatusBadge status={kycStatus} />
            </div>

            <div className="wf-stats-grid">
              <StatCard label="Total Requests" value="0" accent
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
              />
              <StatCard label="Pending" value="0"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              />
              <StatCard label="My Pickups" value="0"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3V8z"/></svg>}
              />
              <StatCard label="Completed" value="0"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              />
            </div>

            <div className="wf-table-card">
              <div className="wf-table-header">
                <span className="wf-table-title">Recent Requests</span>
                <a href="/admin/requests" className="wf-view-all">
                  View all
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
              <div className="wf-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th><th>Contractor</th><th>Site</th>
                      <th>Skip Size</th><th>Date</th><th>Status</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_REQUESTS.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "32px 18px", color: "#9ab8a5" }}>
                          No requests yet.
                        </td>
                      </tr>
                    ) : (
                      MOCK_REQUESTS.map(req => (
                        <tr key={req.id}>
                          <td><span className="wf-id-cell">{req.id}</span></td>
                          <td>{req.contractor}</td>
                          <td>{req.site}</td>
                          <td>{req.size}</td>
                          <td style={{ color: "#8aab97" }}>{req.date}</td>
                          <td><StatusBadge status={req.status} /></td>
                          <td><button className="wf-action-btn">Review</button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
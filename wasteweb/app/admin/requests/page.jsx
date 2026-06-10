"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";

const TABS = ["All", "Pending", "Scheduled", "Arriving", "In Transit", "Completed", "Declined"];

const STATUS_CONFIG = {
  Pending:    { bg: "rgba(251,191,36,0.12)",  color: "#b45309", border: "rgba(251,191,36,0.35)",  dot: "#f59e0b" },
  Scheduled:  { bg: "rgba(59,130,246,0.10)",  color: "#1d4ed8", border: "rgba(59,130,246,0.3)",   dot: "#3b82f6" },
  Arriving:   { bg: "rgba(34,211,238,0.10)",  color: "#0e7490", border: "rgba(34,211,238,0.3)",   dot: "#06b6d4" },
  "In Transit":{ bg: "rgba(168,85,247,0.10)", color: "#7c3aed", border: "rgba(168,85,247,0.3)",   dot: "#a855f7" },
  Completed:  { bg: "rgba(184,213,46,0.12)",  color: "#3a6b00", border: "rgba(184,213,46,0.35)",  dot: "#B8D52E" },
  Declined:   { bg: "rgba(239,68,68,0.10)",   color: "#b91c1c", border: "rgba(239,68,68,0.25)",   dot: "#ef4444" },
};

const WASTE_TYPE_CONFIG = {
  Mixed:    { bg: "rgba(168,85,247,0.10)", color: "#7c3aed", border: "rgba(168,85,247,0.25)" },
  Metal:    { bg: "rgba(100,116,139,0.10)",color: "#475569", border: "rgba(100,116,139,0.25)" },
  Concrete: { bg: "rgba(120,113,108,0.10)",color: "#57534e", border: "rgba(120,113,108,0.25)" },
  Green:    { bg: "rgba(34,197,94,0.10)",  color: "#15803d", border: "rgba(34,197,94,0.25)"  },
  Hazardous:{ bg: "rgba(239,68,68,0.10)",  color: "#b91c1c", border: "rgba(239,68,68,0.25)"  },
  General:  { bg: "rgba(59,130,246,0.10)", color: "#1d4ed8", border: "rgba(59,130,246,0.25)" },
};

const MOCK_REQUESTS = [
  {
    id: "WF-0041", title: "Concrete debris",
    wasteType: "Mixed", status: "Arriving",
    location: "Allen Street, London",
    dates: "Jun 5 – Jun 10, 2026",
    weight: "12 Tons", note: "Handle with care",
  },
  {
    id: "WF-0040", title: "Concrete removal",
    wasteType: "Metal", status: "Pending",
    location: "Kent, United Kingdom",
    dates: "May 31 – Jul 31, 2026",
    weight: "23 Tonnes", note: "",
  },
  {
    id: "WF-0039", title: "General waste",
    wasteType: "Mixed", status: "Completed",
    location: "854 Bristol Road, Selly Oak",
    dates: "Feb 25 – Feb 26, 2026",
    weight: "14 Tonnes", note: "Ring Temi when you arrive",
  },
  {
    id: "WF-0038", title: "Site clearance",
    wasteType: "Concrete", status: "Scheduled",
    location: "Canary Wharf, E14",
    dates: "Jun 12 – Jun 14, 2026",
    weight: "30 Tonnes", note: "Access via rear gate",
  },
  {
    id: "WF-0037", title: "Green waste removal",
    wasteType: "Green", status: "In Transit",
    location: "Hackney, E8",
    dates: "Jun 9 – Jun 9, 2026",
    weight: "6 Tonnes", note: "",
  },
  {
    id: "WF-0036", title: "Hazardous materials",
    wasteType: "Hazardous", status: "Declined",
    location: "Stratford, E15",
    dates: "Jun 1 – Jun 3, 2026",
    weight: "4 Tonnes", note: "Requires specialist handling",
  },
];

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase",
      padding: "3px 9px", borderRadius: 999,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      fontFamily: "'Quicksand', sans-serif",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function WasteTypeBadge({ type }) {
  const c = WASTE_TYPE_CONFIG[type] || WASTE_TYPE_CONFIG.General;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: "0.7rem", fontWeight: 600,
      padding: "3px 9px", borderRadius: 999,
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      fontFamily: "'Quicksand', sans-serif",
      whiteSpace: "nowrap",
    }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
      {type}
    </span>
  );
}

function RequestCard({ req, onAccept, onDecline }) {
  const isPending = req.status === "Pending";
  const isDeclined = req.status === "Declined";
  const isCompleted = req.status === "Completed";

  return (
    <div className="wf-card" style={{
      background: "#ffffff",
      border: "1px solid #e8f2eb",
      borderRadius: 16,
      padding: "20px",
      display: "flex", flexDirection: "column", gap: 14,
      boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
      transition: "box-shadow 0.2s, transform 0.2s",
      fontFamily: "'Quicksand', sans-serif",
    }}>
      {/* Title + badges */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <h3 style={{
            fontSize: "1rem", fontWeight: 700,
            color: "#1a2e1f", margin: 0,
            fontFamily: "'Quicksand', sans-serif",
            lineHeight: 1.3,
          }}>{req.title}</h3>
          <span style={{
            fontSize: "0.65rem", fontWeight: 700, color: "#9ab8a5",
            fontFamily: "'Quicksand', sans-serif",
            whiteSpace: "nowrap", letterSpacing: "0.04em",
          }}>{req.id}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <WasteTypeBadge type={req.wasteType} />
          <StatusBadge status={req.status} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#f0f7f2" }} />

      {/* Meta */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <MetaRow icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        } text={req.location} />
        <MetaRow icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        } text={req.dates} />
        <MetaRow icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        } text={req.weight} />
        {req.note && (
          <MetaRow icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          } text={req.note} muted />
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
        {isPending ? (
          <>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onAccept(req.id)} className="wf-btn-accept" style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "#1a4d2e", color: "#B8D52E",
                fontSize: "0.82rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif",
                transition: "background 0.18s, transform 0.15s",
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Accept
              </button>
            </div>
            <button onClick={() => onDecline(req.id)} className="wf-btn-decline" style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer",
              background: "#ef4444", color: "#fff",
              fontSize: "0.82rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif",
              transition: "background 0.18s",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Decline
            </button>
          </>
        ) : (
          <button className="wf-btn-view" style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 16px", borderRadius: 10, cursor: "pointer",
            background: "none", border: "1px solid #e8f2eb",
            color: "#1a4d2e", fontSize: "0.82rem", fontWeight: 700,
            fontFamily: "'Quicksand', sans-serif",
            transition: "background 0.18s, border-color 0.18s",
          }}>
            View Details
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function MetaRow({ icon, text, muted }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
      <span style={{ color: "#8aab97", marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <span style={{
        fontSize: "0.8rem", fontWeight: 600,
        color: muted ? "#8aab97" : "#3a5a45",
        fontFamily: "'Quicksand', sans-serif",
        lineHeight: 1.4,
      }}>{text}</span>
    </div>
  );
}

export default function RequestsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const filtered = requests.filter((r) => {
    const matchTab = activeTab === "All" || r.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.title.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.wasteType.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const handleAccept = (id) => {
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: "Scheduled" } : r)
    );
  };

  const handleDecline = (id) => {
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: "Declined" } : r)
    );
  };

  const counts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === "All"
      ? requests.length
      : requests.filter((r) => r.status === tab).length;
    return acc;
  }, {});

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wf-admin-root {
          display: flex; min-height: 100vh;
          background: #f5faf6;
          font-family: 'Quicksand', sans-serif;
        }

        .wf-admin-main {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column;
          height: 100vh; overflow-y: auto;
        }

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

        .wf-hamburger {
          display: none;
          background: none; border: none; cursor: pointer;
          color: #1a4d2e; padding: 6px; border-radius: 8px;
          align-items: center; justify-content: center;
          transition: background 0.18s; flex-shrink: 0;
        }
        .wf-hamburger:hover { background: rgba(184,213,46,0.12); }

        .wf-topbar-title {
          font-size: 1rem; font-weight: 700;
          color: #1a2e1f; font-family: 'Quicksand', sans-serif;
        }

        .wf-topbar-right {
          display: flex; align-items: center; gap: 10px;
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

        /* Page content */
        .wf-content {
          padding: 28px;
          display: flex; flex-direction: column; gap: 24px;
        }

        /* Page header */
        .wf-page-header h1 {
          font-size: clamp(1.4rem, 2.5vw, 1.75rem);
          font-weight: 700; color: #1a2e1f;
          letter-spacing: -0.02em; margin-bottom: 4px;
          font-family: 'Quicksand', sans-serif;
        }
        .wf-page-header p {
          font-size: 0.875rem; color: #6b8f7a;
          font-weight: 600; font-family: 'Quicksand', sans-serif;
        }

        /* Search + filter bar */
        .wf-search-row {
          display: flex; align-items: center; gap: 12px;
        }

        .wf-search-wrap {
          flex: 1; position: relative;
        }

        .wf-search-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          color: #8aab97; pointer-events: none;
          display: flex; align-items: center;
        }

        .wf-search-input {
          width: 100%; padding: 11px 14px 11px 40px;
          border: 1px solid #e8f2eb; border-radius: 12px;
          background: #ffffff; font-size: 0.875rem;
          font-weight: 600; color: #1a2e1f;
          font-family: 'Quicksand', sans-serif;
          outline: none; transition: border 0.18s, box-shadow 0.18s;
        }
        .wf-search-input::placeholder { color: #9ab8a5; }
        .wf-search-input:focus {
          border-color: #B8D52E;
          box-shadow: 0 0 0 3px rgba(184,213,46,0.12);
        }

        .wf-filter-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 11px 18px; border-radius: 12px;
          border: 1px solid #e8f2eb; background: #ffffff;
          color: #3a5a45; font-size: 0.875rem; font-weight: 700;
          font-family: 'Quicksand', sans-serif; cursor: pointer;
          white-space: nowrap; transition: border 0.18s, background 0.18s;
          flex-shrink: 0;
        }
        .wf-filter-btn:hover { border-color: #B8D52E; background: #f5faf6; }

        /* Tabs */
        .wf-tabs-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .wf-tabs-wrap::-webkit-scrollbar { display: none; }

        .wf-tabs {
          display: flex; gap: 4px;
          background: #ffffff; border: 1px solid #e8f2eb;
          border-radius: 12px; padding: 5px;
          width: fit-content; min-width: 100%;
        }

        .wf-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 9px;
          border: none; background: none; cursor: pointer;
          font-size: 0.8rem; font-weight: 700;
          font-family: 'Quicksand', sans-serif;
          color: #6b8f7a; white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }
        .wf-tab:hover { background: #f0f7f2; color: #1a4d2e; }
        .wf-tab.active {
          background: #1a4d2e; color: #B8D52E;
        }

        .wf-tab-count {
          font-size: 0.65rem; font-weight: 700;
          padding: 1px 6px; border-radius: 999px;
          background: rgba(255,255,255,0.15);
          color: inherit;
        }
        .wf-tab:not(.active) .wf-tab-count {
          background: #f0f7f2; color: #8aab97;
        }

        /* Cards grid */
        .wf-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          align-items: start;
        }

        /* Card hover */
        .wf-card:hover {
          box-shadow: 0 4px 20px rgba(26,77,46,0.1) !important;
          transform: translateY(-2px);
        }

        /* Button hovers */
        .wf-btn-accept:hover { background: #B8D52E !important; color: #0d2416 !important; }
        .wf-btn-decline:hover { background: #dc2626 !important; }
        .wf-btn-view:hover { background: #f0f7f2 !important; border-color: #B8D52E !important; }

        /* Empty state */
        .wf-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 64px 24px; gap: 12px; text-align: center;
        }

        /* Mobile */
        @media (max-width: 1100px) {
          .wf-cards-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .wf-hamburger { display: flex; }
          .wf-topbar { padding: 0 16px; }
          .wf-content { padding: 16px; gap: 16px; }
          .wf-cards-grid { grid-template-columns: 1fr; }
          .wf-filter-btn span { display: none; }
        }

        @media (max-width: 480px) {
          .wf-topbar-date { display: none; }
        }
      `}</style>

      <div className="wf-admin-root">
        <Sidebar
          adminEmail="admin@wasteflow.org"
          adminName="Admin"
          onSignOut={() => { window.location.href = "/login"; }}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(true)}
          onExpand={() => setCollapsed(false)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="wf-admin-main">
          {/* Topbar */}
          <div className="wf-topbar">
            <div className="wf-topbar-left">
              <button className="wf-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <span className="wf-topbar-title">All Requests</span>
            </div>
            <div className="wf-topbar-right">
              <span style={{ fontSize: "0.75rem", color: "#8aab97", fontWeight: 600, fontFamily: "'Quicksand', sans-serif" }} className="wf-topbar-date">
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

            {/* Page header */}
            <div className="wf-page-header">
              <h1>All Pickup Requests</h1>
              <p>Review and manage incoming pickup requests</p>
            </div>

            {/* Search + filter */}
            <div className="wf-search-row">
              <div className="wf-search-wrap">
                <span className="wf-search-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
                <input
                  className="wf-search-input"
                  type="text"
                  placeholder="Search by title, location, or waste type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="wf-filter-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                <span>Filters</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="wf-tabs-wrap">
              <div className="wf-tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    className={`wf-tab${activeTab === tab ? " active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                    {counts[tab] > 0 && (
                      <span className="wf-tab-count">{counts[tab]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards */}
            <div className="wf-cards-grid">
              {filtered.length === 0 ? (
                <div className="wf-empty">
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: "#f0f7f2",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#8aab97",
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#3a5a45", fontFamily: "'Quicksand', sans-serif" }}>
                    No requests found
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#8aab97", fontWeight: 600, fontFamily: "'Quicksand', sans-serif" }}>
                    Try adjusting your search or filter
                  </p>
                </div>
              ) : (
                filtered.map((req) => (
                  <RequestCard
                    key={req.id}
                    req={req}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                ))
              )}
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
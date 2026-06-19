"use client";
import { useEffect, useState } from "react";
import {
  collection, query, where, orderBy, onSnapshot, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthGuard } from "../../hooks/Useauthguard ";
import Sidebar from "../sidebar";
import OperatorRequestDetailModal from "../myrequests/Operatorrequestdetailmodal ";

const TABS = ["All", "Pending", "Accepted", "Arriving", "In Progress", "Completed"];

const STATUS_CONFIG = {
  Pending:       { bg: "rgba(251,191,36,0.12)",  color: "#b45309", border: "rgba(251,191,36,0.35)",  dot: "#f59e0b"  },
  Accepted:      { bg: "rgba(59,130,246,0.10)",  color: "#1d4ed8", border: "rgba(59,130,246,0.3)",   dot: "#3b82f6"  },
  Arriving:      { bg: "rgba(34,211,238,0.10)",  color: "#0e7490", border: "rgba(34,211,238,0.3)",   dot: "#06b6d4"  },
  "In Progress": { bg: "rgba(168,85,247,0.10)",  color: "#7c3aed", border: "rgba(168,85,247,0.3)",   dot: "#a855f7"  },
  Completed:     { bg: "rgba(184,213,46,0.12)",  color: "#3a6b00", border: "rgba(184,213,46,0.35)",  dot: "#B8D52E"  },
  Declined:      { bg: "rgba(239,68,68,0.10)",   color: "#b91c1c", border: "rgba(239,68,68,0.25)",   dot: "#ef4444"  },
};

const WASTE_TYPE_CONFIG = {
  Mixed:     { bg: "rgba(168,85,247,0.10)",  color: "#7c3aed", border: "rgba(168,85,247,0.25)" },
  Metal:     { bg: "rgba(100,116,139,0.10)", color: "#475569", border: "rgba(100,116,139,0.25)" },
  Concrete:  { bg: "rgba(120,113,108,0.10)", color: "#57534e", border: "rgba(120,113,108,0.25)" },
  Green:     { bg: "rgba(34,197,94,0.10)",   color: "#15803d", border: "rgba(34,197,94,0.25)"  },
  Hazardous: { bg: "rgba(239,68,68,0.10)",   color: "#b91c1c", border: "rgba(239,68,68,0.25)"  },
  General:   { bg: "rgba(59,130,246,0.10)",  color: "#1d4ed8", border: "rgba(59,130,246,0.25)" },
};

// Maps Firestore lowercase status values to display labels
const STATUS_DISPLAY: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  arriving: "Arriving",
  in_progress: "In Progress",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Declined",
};

type FirestoreRequest = {
  id: string;
  title: string;
  wasteType: string;
  status: string;
  location: string;
  windowStart?: string;
  windowEnd?: string;
  quantity?: string;
  notes?: string;
  contractorId: string;
  operatorId?: string;
  operatorName?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

type RequestItem = {
  id: string;
  title: string;
  wasteType: string;
  status: string;
  location: string;
  dates: string;
  weight: string;
  note: string;
  operatorName?: string;
  operatorId?: string;
};

function formatDateRange(start?: string, end?: string) {
  if (!start) return "—";
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  if (!end || end === start) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

function mapDoc(d: FirestoreRequest): RequestItem {
  return {
    id: d.id,
    title: d.title,
    wasteType: d.wasteType,
    status: STATUS_DISPLAY[d.status] || "Pending",
    location: d.location,
    dates: formatDateRange(d.windowStart, d.windowEnd),
    weight: d.quantity || "—",
    note: d.notes || "",
    operatorName: d.operatorName,
    operatorId: d.operatorId,
  };
}

function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
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

function WasteTypeBadge({ type }: { type: keyof typeof WASTE_TYPE_CONFIG }) {
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
      {type}
    </span>
  );
}

function MetaRow({ icon, text, muted }: { icon: React.ReactNode; text: string; muted?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span style={{ color: "#8aab97", marginTop: 1, flexShrink: 0, display: "flex" }}>{icon}</span>
      <span style={{
        fontSize: "0.82rem", fontWeight: 600,
        color: muted ? "#8aab97" : "#3a5a45",
        fontFamily: "'Quicksand', sans-serif",
        lineHeight: 1.4,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{text}</span>
    </div>
  );
}

function RequestCard({ req, onViewDetails }: { req: RequestItem; onViewDetails: (req: RequestItem) => void }) {
  const isDeclined = req.status === "Declined";
  
  return (
    <div className="or-card" style={{
      background: "#ffffff",
      border: `1px solid ${isDeclined ? '#f5c6c6' : '#e8f2eb'}`,
      borderRadius: 16,
      padding: "20px",
      display: "flex", flexDirection: "column", gap: 14,
      boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
      transition: "box-shadow 0.2s, transform 0.2s",
      fontFamily: "'Quicksand', sans-serif",
      cursor: "default",
      opacity: isDeclined ? 0.7 : 1,
    }}>
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
            whiteSpace: "nowrap", letterSpacing: "0.04em", flexShrink: 0,
          }}>{req.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <WasteTypeBadge type={req.wasteType as keyof typeof WASTE_TYPE_CONFIG} />
          <StatusBadge status={req.status as keyof typeof STATUS_CONFIG} />
        </div>
      </div>

      <div style={{ height: 1, background: "#f0f7f2" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <MetaRow
          text={req.location}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          }
        />
        <MetaRow
          text={req.dates}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          }
        />
        <MetaRow
          text={req.weight}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          }
        />
        {req.operatorName && (
          <MetaRow
            text={`Operator: ${req.operatorName}`}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            }
          />
        )}
        {req.note && (
          <MetaRow
            text={req.note}
            muted
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            }
          />
        )}
      </div>

      <button
        className="or-card-btn"
        onClick={() => onViewDetails(req)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 7,
          padding: "10px 16px", borderRadius: 10, cursor: "pointer",
          background: "none", border: "1px solid #e8f2eb",
          color: "#1a4d2e", fontSize: "0.82rem", fontWeight: 700,
          fontFamily: "'Quicksand', sans-serif",
          transition: "background 0.18s, border-color 0.18s",
          marginTop: "auto",
        }}
      >
        View Details
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div style={{
      gridColumn: "1 / -1",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "72px 24px", gap: 14, textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: "#f0f7f2",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#8aab97",
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
      <div>
        <p style={{
          fontSize: "0.95rem", fontWeight: 700, color: "#3a5a45",
          fontFamily: "'Quicksand', sans-serif", margin: "0 0 4px",
        }}>
          {hasSearch ? "No matching requests" : "No requests yet"}
        </p>
        <p style={{
          fontSize: "0.82rem", color: "#8aab97", fontWeight: 600,
          fontFamily: "'Quicksand', sans-serif", margin: 0,
        }}>
          {hasSearch
            ? "Try adjusting your search or switching tabs"
            : "Your requests will appear here once created"}
        </p>
      </div>
    </div>
  );
}

export default function MyRequestsPage() {
  const { user, profile, loading: guardLoading } = useAuthGuard("kyc-complete");

  const [collapsed, setCollapsed]       = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [activeTab, setActiveTab]       = useState("All");
  const [search, setSearch]             = useState("");
  const [requests, setRequests]         = useState<RequestItem[]>([]);
  const [loadingReqs, setLoadingReqs]   = useState(true);
  const [loadError, setLoadError]       = useState("");
  const [selectedReq, setSelectedReq]   = useState<RequestItem | null>(null);

  // Live Firestore subscription for user's own requests
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "wasteRequests"),
      where("contractorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((doc) =>
          mapDoc({ id: doc.id, ...(doc.data() as Omit<FirestoreRequest, "id">) })
        );
        setRequests(items);
        setLoadingReqs(false);
        setLoadError("");
      },
      (err) => {
        console.error("Failed to load requests:", err);
        setLoadError("Couldn't load your requests. Please refresh the page.");
        setLoadingReqs(false);
      }
    );

    return () => unsub();
  }, [user]);

  // Filter requests based on tab and search
  const filtered = requests.filter((r) => {
    const matchTab = activeTab === "All" || r.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.wasteType.toLowerCase().includes(q) ||
      (r.operatorName && r.operatorName.toLowerCase().includes(q));
    return matchTab && matchSearch;
  });

  // Count requests per status
  const counts = TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab] = tab === "All"
      ? requests.length
      : requests.filter((r) => r.status === tab).length;
    return acc;
  }, {});

  if (guardLoading || loadingReqs) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5faf6" }}>
        <style>{`@keyframes wfSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <svg viewBox="0 0 24 24" fill="none" stroke="#1a4d2e" strokeWidth="2.5" style={{ width: 28, height: 28, animation: "wfSpin 0.8s linear infinite" }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .or-root {
          display: flex; min-height: 100vh;
          background: #f5faf6;
          font-family: 'Quicksand', sans-serif;
        }

        .or-main {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column;
          height: 100vh; overflow-y: auto;
        }

        .or-topbar {
          position: sticky; top: 0; z-index: 10;
          background: rgba(245,250,246,0.92);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #e8f2eb;
          padding: 0 28px; height: 60px;
          display: flex; align-items: center;
          justify-content: space-between; flex-shrink: 0;
        }
        .or-topbar-left { display: flex; align-items: center; gap: 14px; }
        .or-topbar-title {
          font-size: 1rem; font-weight: 700;
          color: #1a2e1f; font-family: 'Quicksand', sans-serif;
        }
        .or-topbar-right { display: flex; align-items: center; gap: 10px; }

        .or-hamburger {
          display: none;
          background: none; border: none; cursor: pointer;
          color: #1a4d2e; padding: 6px; border-radius: 8px;
          align-items: center; justify-content: center;
          transition: background 0.18s;
        }
        .or-hamburger:hover { background: rgba(184,213,46,0.12); }

        .or-notif-btn {
          width: 34px; height: 34px; border-radius: 9px;
          background: #ffffff; border: 1px solid #e8f2eb;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #4a7a5a; position: relative;
          transition: border 0.18s, color 0.18s;
        }
        .or-notif-btn:hover { border-color: #B8D52E; color: #1a4d2e; }
        .or-notif-dot {
          position: absolute; top: 7px; right: 7px;
          width: 7px; height: 7px; border-radius: 50%;
          background: #B8D52E; border: 1.5px solid #f5faf6;
        }

        .or-content {
          padding: 28px;
          display: flex; flex-direction: column; gap: 24px;
          max-width: 1400px; width: 100%;
        }

        .or-page-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 16px;
          flex-wrap: wrap;
        }
        .or-page-header h1 {
          font-size: clamp(1.4rem, 2.5vw, 1.75rem);
          font-weight: 800; color: #1a2e1f;
          letter-spacing: -0.02em;
          font-family: 'Quicksand', sans-serif;
          margin-bottom: 4px;
        }
        .or-page-header p {
          font-size: 0.875rem; color: #6b8f7a;
          font-weight: 600; font-family: 'Quicksand', sans-serif;
        }

        .or-search-row { display: flex; align-items: center; gap: 12px; }
        .or-search-wrap { flex: 1; position: relative; }
        .or-search-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          color: #8aab97; pointer-events: none;
          display: flex; align-items: center;
        }
        .or-search-input {
          width: 100%; padding: 11px 14px 11px 40px;
          border: 1px solid #e8f2eb; border-radius: 12px;
          background: #ffffff; font-size: 0.875rem;
          font-weight: 600; color: #1a2e1f;
          font-family: 'Quicksand', sans-serif;
          outline: none; transition: border 0.18s, box-shadow 0.18s;
        }
        .or-search-input::placeholder { color: #9ab8a5; }
        .or-search-input:focus {
          border-color: #B8D52E;
          box-shadow: 0 0 0 3px rgba(184,213,46,0.12);
        }
        .or-filter-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 11px 18px; border-radius: 12px;
          border: 1px solid #e8f2eb; background: #ffffff;
          color: #3a5a45; font-size: 0.875rem; font-weight: 700;
          font-family: 'Quicksand', sans-serif; cursor: pointer;
          white-space: nowrap; flex-shrink: 0;
          transition: border 0.18s, background 0.18s;
        }
        .or-filter-btn:hover { border-color: #B8D52E; background: #f5faf6; }

        .or-tabs-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .or-tabs-wrap::-webkit-scrollbar { display: none; }
        .or-tabs {
          display: flex; gap: 4px;
          background: #ffffff; border: 1px solid #e8f2eb;
          border-radius: 12px; padding: 5px;
          width: fit-content; min-width: 100%;
        }
        .or-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 9px;
          border: none; background: none; cursor: pointer;
          font-size: 0.8rem; font-weight: 700;
          font-family: 'Quicksand', sans-serif;
          color: #6b8f7a; white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }
        .or-tab:hover { background: #f0f7f2; color: #1a4d2e; }
        .or-tab.active { background: #1a4d2e; color: #B8D52E; }
        .or-tab-count {
          font-size: 0.65rem; font-weight: 700;
          padding: 1px 6px; border-radius: 999px;
          background: #f0f7f2; color: #8aab97;
        }
        .or-tab.active .or-tab-count {
          background: rgba(255,255,255,0.15); color: #B8D52E;
        }

        .or-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          align-items: start;
        }

        .or-card:hover {
          box-shadow: 0 4px 20px rgba(26,77,46,0.09) !important;
          transform: translateY(-2px);
        }
        .or-card-btn:hover {
          background: #f0f7f2 !important;
          border-color: #B8D52E !important;
        }

        .or-error-banner {
          background: #fff5f5; border: 1px solid #f5c6c6; border-radius: 10px;
          padding: 11px 14px; display: flex; align-items: flex-start; gap: 9px;
        }
        .or-error-banner p {
          font-size: 0.78rem; color: #c0392b; font-weight: 600;
          font-family: 'Quicksand', sans-serif; margin: 0; line-height: 1.5;
        }

        @media (max-width: 1100px) { .or-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .or-hamburger { display: flex; }
          .or-topbar { padding: 0 16px; }
          .or-content { padding: 16px; gap: 16px; }
          .or-grid { grid-template-columns: 1fr; }
          .or-filter-btn span { display: none; }
        }
        @media (max-width: 480px) {
          .or-topbar-date { display: none; }
          .or-page-header { flex-direction: column; }
        }
      `}</style>

      <div className="or-root">
        <Sidebar
          adminEmail={profile?.email || ""}
          adminName={profile?.fullName || "User"}
          onSignOut={() => { window.location.href = "/login"; }}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(true)}
          onExpand={() => setCollapsed(false)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="or-main">

          <div className="or-topbar">
            <div className="or-topbar-left">
              <button
                className="or-hamburger"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <span className="or-topbar-title">My Requests</span>
            </div>
            <div className="or-topbar-right">
              <span
                className="or-topbar-date"
                style={{
                  fontSize: "0.75rem", color: "#8aab97",
                  fontWeight: 600, fontFamily: "'Quicksand', sans-serif",
                }}
              >
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "short", day: "numeric",
                  month: "short", year: "numeric",
                })}
              </span>
              <button className="or-notif-btn" aria-label="Notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span className="or-notif-dot" />
              </button>
            </div>
          </div>

          <div className="or-content">

            <div className="or-page-header">
              <div>
                <h1>My Requests</h1>
                <p>Track your submitted pickup requests in real-time</p>
              </div>
            </div>

            {loadError && (
              <div className="or-error-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>{loadError}</p>
              </div>
            )}

            <div className="or-search-row">
              <div className="or-search-wrap">
                <span className="or-search-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
                <input
                  className="or-search-input"
                  type="text"
                  placeholder="Search by title, location, waste type, or operator..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="or-filter-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                <span>Filters</span>
              </button>
            </div>

            <div className="or-tabs-wrap">
              <div className="or-tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    className={`or-tab${activeTab === tab ? " active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                    {counts[tab] > 0 && (
                      <span className="or-tab-count">{counts[tab]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="or-grid">
              {filtered.length === 0 ? (
                <EmptyState hasSearch={!!search} />
              ) : (
                filtered.map((req) => (
                  <RequestCard
                    key={req.id}
                    req={req}
                    onViewDetails={setSelectedReq}
                  />
                ))
              )}
            </div>

          </div>
        </main>
      </div>

      <OperatorRequestDetailModal
        item={selectedReq}
        onClose={() => setSelectedReq(null)}
        onResubmit={() => {}}
      />
    </>
  );
}
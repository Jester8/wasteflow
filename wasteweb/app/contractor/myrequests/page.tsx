"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../sidebar";
import CreateRequestModal from "./Createrequestmodal";
import OperatorRequestDetailModal from "./Operatorrequestdetailmodal ";

// ── Types ────────────────────────────────────────────────────────────────────

export type RequestItem = {
  id: string;
  title: string;
  wasteType: string;
  location: string;
  dates: string;
  weight: string;
  note: string;
  status: string; // display label, e.g. "Awaiting Approval"
  rawStatus: string; // raw Firestore status, e.g. "pending"
  createdAt?: string;
};

// Maps Firestore's lowercase status → the capitalized display label
// that OperatorRequestDetailModal's STATUS_CONFIG / STATUS_STEPS / BANNERS expect.
const STATUS_DISPLAY_MAP: Record<string, string> = {
  pending: "Awaiting Approval",
  scheduled: "Scheduled",
  arriving: "Arriving",
  in_transit: "In Transit",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Declined", // closest visual treatment; adjust if a distinct state is added later
};

function toDisplayStatus(rawStatus: string): string {
  return STATUS_DISPLAY_MAP[rawStatus] || "Awaiting Approval";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateRange(start?: string, end?: string) {
  if (!start) return "—";
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  if (!end || end === start) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

const WASTE_TYPE_CONFIG = {
  Mixed: { bg: "rgba(168,85,247,0.10)", color: "#7c3aed", border: "rgba(168,85,247,0.25)" },
  Metal: { bg: "rgba(100,116,139,0.10)", color: "#475569", border: "rgba(100,116,139,0.25)" },
  Concrete: { bg: "rgba(120,113,108,0.10)", color: "#57534e", border: "rgba(120,113,108,0.25)" },
  Green: { bg: "rgba(34,197,94,0.10)", color: "#15803d", border: "rgba(34,197,94,0.25)" },
  Hazardous: { bg: "rgba(239,68,68,0.10)", color: "#b91c1c", border: "rgba(239,68,68,0.25)" },
  General: { bg: "rgba(59,130,246,0.10)", color: "#1d4ed8", border: "rgba(59,130,246,0.25)" },
};

type WasteType = keyof typeof WASTE_TYPE_CONFIG;

const STATUS_BADGE_CONFIG: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  "Awaiting Approval": { bg: "rgba(251,191,36,0.12)", color: "#b45309", border: "rgba(251,191,36,0.35)", dot: "#f59e0b" },
  Scheduled: { bg: "rgba(59,130,246,0.10)", color: "#1d4ed8", border: "rgba(59,130,246,0.3)", dot: "#3b82f6" },
  Arriving: { bg: "rgba(34,211,238,0.10)", color: "#0e7490", border: "rgba(34,211,238,0.3)", dot: "#06b6d4" },
  "In Transit": { bg: "rgba(168,85,247,0.10)", color: "#7c3aed", border: "rgba(168,85,247,0.3)", dot: "#a855f7" },
  Completed: { bg: "rgba(184,213,46,0.12)", color: "#3a6b00", border: "rgba(184,213,46,0.35)", dot: "#B8D52E" },
  Declined: { bg: "rgba(239,68,68,0.10)", color: "#b91c1c", border: "rgba(239,68,68,0.25)", dot: "#ef4444" },
};

function WasteTypeBadge({ type }: { type: string }) {
  const c = WASTE_TYPE_CONFIG[type as WasteType] || WASTE_TYPE_CONFIG.General;
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
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE_CONFIG[status] || STATUS_BADGE_CONFIG["Awaiting Approval"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase",
      padding: "4px 10px", borderRadius: 999,
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

function MetaRow({ icon, text, muted }: { icon: React.ReactNode; text: string; muted?: boolean }) {
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

function RequestCard({ item, onViewDetails }: { item: RequestItem; onViewDetails: (item: RequestItem) => void }) {
  return (
    <div className="wf-req-card" style={{
      background: "#ffffff",
      border: "1px solid #e8f2eb",
      borderRadius: 16,
      padding: "20px",
      display: "flex", flexDirection: "column", gap: 14,
      boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
      transition: "box-shadow 0.2s, transform 0.2s",
      fontFamily: "'Quicksand', sans-serif",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <h3 style={{
            fontSize: "1rem", fontWeight: 700,
            color: "#1a2e1f", margin: 0,
            fontFamily: "'Quicksand', sans-serif",
            lineHeight: 1.3,
          }}>{item.title}</h3>
          <span style={{
            fontSize: "0.65rem", fontWeight: 700, color: "#9ab8a5",
            fontFamily: "'Quicksand', sans-serif",
            whiteSpace: "nowrap", letterSpacing: "0.04em",
          }}>{item.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <WasteTypeBadge type={item.wasteType} />
          <StatusBadge status={item.status} />
        </div>
      </div>

      <div style={{ height: 1, background: "#f0f7f2" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <MetaRow icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
        } text={item.location} />
        <MetaRow icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        } text={item.dates} />
        <MetaRow icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        } text={item.weight} />
      </div>

      <div style={{ marginTop: 2 }}>
        <button
          className="wf-req-btn-view"
          onClick={() => onViewDetails(item)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 16px", borderRadius: 10, cursor: "pointer",
            background: "none", border: "1px solid #e8f2eb",
            color: "#1a4d2e", fontSize: "0.82rem", fontWeight: 700,
            fontFamily: "'Quicksand', sans-serif",
            transition: "background 0.18s, border-color 0.18s",
          }}
        >
          View Details
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: "#ffffff", border: "1px solid #e8f2eb",
      borderRadius: 16, padding: "20px",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      {[["70%", 14], ["50%", 10], ["90%", 10], ["60%", 10]].map(([w, h], i) => (
        <div key={i} style={{
          height: h as number, width: w as string, borderRadius: 6,
          background: "#f0f7f2", animation: "wfPulse 1.4s ease-in-out infinite",
        }} />
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MyRequestsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<RequestItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { user, profile } = useAuth();

  // ── Firestore: this contractor's own requests, live ───────────────────────
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
        setRequests(
          snap.docs.map((d) => {
            const data = d.data();
            const rawStatus = data.status || "pending";
            return {
              id: d.id,
              title: data.title || "Untitled",
              wasteType: data.wasteType || "General",
              location: data.location || "—",
              dates: formatDateRange(data.windowStart, data.windowEnd),
              weight: data.quantity ? `${data.quantity} ${data.weightUnit || ""}`.trim() : "—",
              note: data.notes || "",
              status: toDisplayStatus(rawStatus),
              rawStatus,
              createdAt: data.createdAt,
            } as RequestItem;
          })
        );
        setLoading(false);
      },
      (err) => {
        console.error("MyRequests error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  // Keep modal data live — find the latest version of the selected item
  const liveSelectedItem = selectedItem
    ? requests.find((r) => r.id === selectedItem.id) ?? selectedItem
    : null;

  const filtered = requests.filter((item) => {
    const q = search.toLowerCase();
    return !q ||
      item.title.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.wasteType.toLowerCase().includes(q);
  });

  // ── Create: writes to Firestore with the shape the security rules require ──
  // Rule requires: contractorId == auth.uid, status == 'pending' (lowercase).
  async function handleCreateSubmit(formPayload: any) {
    if (!user) return;
    try {
      await addDoc(collection(db, "wasteRequests"), {
        title: formPayload.title,
        wasteType: formPayload.wasteType,
        location: formPayload.location,
        windowStart: formPayload.dateFrom,
        windowEnd: formPayload.dateTo,
        quantity: formPayload.weight,
        weightUnit: formPayload.weightUnit,
        notes: formPayload.note,
        contractorId: user.uid,
        status: "pending", // lowercase — required by Firestore rules on create
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to create request:", err);
    }
  }

  // ── Resubmit a declined request: same path as create, prefilled ───────────
  function handleResubmit(item: RequestItem) {
    // Reopen the create modal; CreateRequestModal currently starts from an
    // empty form, so prefill wiring can be added there if needed later.
    setCreateOpen(true);
  }

  const displayName = profile?.fullName || user?.email?.split("@")[0] || "Contractor";
  const displayEmail = profile?.email || user?.email || "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');
        @keyframes wfPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
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

        .wf-topbar-left { display: flex; align-items: center; gap: 14px; }

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

        .wf-new-btn {
          display: flex; align-items: center; gap: 7;
          padding: 9px 16px; border-radius: 10px; cursor: pointer;
          background: #1a4d2e; border: none;
          color: #B8D52E; font-size: 0.82rem; font-weight: 700;
          font-family: 'Quicksand', sans-serif;
          transition: background 0.18s, color 0.18s;
        }
        .wf-new-btn:hover { background: #B8D52E; color: #0d2416; }

        .wf-content {
          padding: 28px;
          display: flex; flex-direction: column; gap: 24px;
        }

        .wf-page-header {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap;
        }
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

        .wf-search-row { display: flex; align-items: center; gap: 12px; }
        .wf-search-wrap { flex: 1; position: relative; }

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

        .wf-req-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          align-items: start;
        }

        .wf-req-card:hover {
          box-shadow: 0 4px 20px rgba(26,77,46,0.1) !important;
          transform: translateY(-2px);
        }

        .wf-req-btn-view:hover {
          background: #f0f7f2 !important;
          border-color: #B8D52E !important;
        }

        .wf-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 64px 24px; gap: 12px; text-align: center;
        }

        @media (max-width: 1100px) {
          .wf-req-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .wf-hamburger { display: flex; }
          .wf-topbar { padding: 0 16px; }
          .wf-content { padding: 16px; gap: 16px; }
          .wf-req-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="wf-admin-root">
        <Sidebar
          onSignOut={() => { window.location.href = "/login"; }}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(true)}
          onExpand={() => setCollapsed(false)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="wf-admin-main">
          <div className="wf-topbar">
            <div className="wf-topbar-left">
              <button className="wf-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <span className="wf-topbar-title">My Requests</span>
            </div>
          </div>

          <div className="wf-content">

            <div className="wf-page-header">
              <div>
                <h1>My Requests</h1>
                <p>Create and track your pickup requests</p>
              </div>
              <button className="wf-new-btn" onClick={() => setCreateOpen(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Request
              </button>
            </div>

            <div className="wf-search-row">
              <div className="wf-search-wrap">
                <span className="wf-search-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  className="wf-search-input"
                  type="text"
                  placeholder="Search by title, location, or waste type…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="wf-req-grid">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              ) : filtered.length === 0 ? (
                <div className="wf-empty">
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: "#f0f7f2",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#8aab97",
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#3a5a45", fontFamily: "'Quicksand', sans-serif" }}>
                    {search ? "No requests match your search" : "You haven't created any requests yet"}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#8aab97", fontWeight: 600, fontFamily: "'Quicksand', sans-serif" }}>
                    {search ? "Try adjusting your search" : "Tap \"New Request\" to submit your first pickup"}
                  </p>
                </div>
              ) : (
                filtered.map((item) => (
                  <RequestCard
                    key={item.id}
                    item={item}
                    onViewDetails={setSelectedItem}
                  />
                ))
              )}
            </div>

          </div>
        </main>
      </div>

      <CreateRequestModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <OperatorRequestDetailModal
        item={liveSelectedItem}
        onClose={() => setSelectedItem(null)}
        onResubmit={handleResubmit}
      />
    </>
  );
}
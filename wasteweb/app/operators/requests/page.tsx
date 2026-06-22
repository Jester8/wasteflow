"use client";

import { useState, useEffect } from "react";
import {
  collection, query, orderBy, onSnapshot, doc, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Sidebar from "../../components/Sidebar";
import RequestDetailModal from "./components/RequestDetailModal";

const TABS = ["All", "Pending", "Scheduled", "Arriving", "In Transit", "Completed", "Declined"];

const STATUS_CONFIG = {
  Pending:      { bg: "rgba(251,191,36,0.12)",  color: "#b45309", border: "rgba(251,191,36,0.35)",  dot: "#f59e0b" },
  Scheduled:    { bg: "rgba(59,130,246,0.10)",  color: "#1d4ed8", border: "rgba(59,130,246,0.3)",   dot: "#3b82f6" },
  Arriving:     { bg: "rgba(34,211,238,0.10)",  color: "#0e7490", border: "rgba(34,211,238,0.3)",   dot: "#06b6d4" },
  "In Transit": { bg: "rgba(168,85,247,0.10)",  color: "#7c3aed", border: "rgba(168,85,247,0.3)",   dot: "#a855f7" },
  Completed:    { bg: "rgba(184,213,46,0.12)",  color: "#3a6b00", border: "rgba(184,213,46,0.35)",  dot: "#B8D52E" },
  Declined:     { bg: "rgba(239,68,68,0.10)",   color: "#b91c1c", border: "rgba(239,68,68,0.25)",   dot: "#ef4444" },
};

const WASTE_TYPE_CONFIG = {
  Mixed:     { bg: "rgba(168,85,247,0.10)", color: "#7c3aed", border: "rgba(168,85,247,0.25)" },
  Metal:     { bg: "rgba(100,116,139,0.10)",color: "#475569", border: "rgba(100,116,139,0.25)" },
  Concrete:  { bg: "rgba(120,113,108,0.10)",color: "#57534e", border: "rgba(120,113,108,0.25)" },
  Green:     { bg: "rgba(34,197,94,0.10)",  color: "#15803d", border: "rgba(34,197,94,0.25)"  },
  Hazardous: { bg: "rgba(239,68,68,0.10)",  color: "#b91c1c", border: "rgba(239,68,68,0.25)"  },
  General:   { bg: "rgba(59,130,246,0.10)", color: "#1d4ed8", border: "rgba(59,130,246,0.25)" },
};

const STATUS_DISPLAY: Record<string, string> = {
  pending:    "Pending",
  scheduled:  "Scheduled",
  arriving:   "Arriving",
  in_transit: "In Transit",
  completed:  "Completed",
  declined:   "Declined",
  cancelled:  "Declined", // map cancelled → Declined display for now
};

// All valid write values — what gets stored in Firestore
const STATUS_WRITE: Record<string, string> = {
  Pending:      "pending",
  Scheduled:    "scheduled",
  Arriving:     "arriving",
  "In Transit": "in_transit",
  Completed:    "completed",
  Declined:     "declined",
};

export type FirestoreRequest = {
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
  contractorName?: string;
  createdAt?: string;
};

export type RequestItem = {
  id: string;
  title: string;
  wasteType: string;
  status: string;
  location: string;
  dates: string;
  weight: string;
  note: string;
  contractorName?: string;
  contractorId?: string;
  createdAt?: string;
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
    status: STATUS_DISPLAY[d.status] ?? "Pending",
    location: d.location,
    dates: formatDateRange(d.windowStart, d.windowEnd),
    weight: d.quantity || "—",
    note: d.notes || "",
    contractorName: d.contractorName,
    contractorId: d.contractorId,
    createdAt: d.createdAt,
  };
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.Pending;
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

function WasteTypeBadge({ type }: { type: string }) {
  const c = WASTE_TYPE_CONFIG[type as keyof typeof WASTE_TYPE_CONFIG] || WASTE_TYPE_CONFIG.General;
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

function RequestCard({
  req,
  onViewDetails,
}: {
  req: RequestItem;
  onViewDetails: (req: RequestItem) => void;
}) {
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
      {/* Header */}
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
          }}>{req.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <WasteTypeBadge type={req.wasteType} />
          <StatusBadge status={req.status} />
        </div>
      </div>

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
        {req.contractorName && (
          <MetaRow icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          } text={`Contractor: ${req.contractorName}`} />
        )}
        {req.note && (
          <MetaRow icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          } text={req.note} muted />
        )}
      </div>

      {/* Single action — always "View Details" */}
      <button
        className="wf-btn-view"
        onClick={() => onViewDetails(req)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          padding: "11px 16px", borderRadius: 10, cursor: "pointer",
          background: "#1a4d2e", border: "none",
          color: "#B8D52E", fontSize: "0.82rem", fontWeight: 700,
          fontFamily: "'Quicksand', sans-serif",
          transition: "background 0.18s",
          marginTop: "auto",
        }}
      >
        View Details
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>
  );
}

// ── Inline Action Modal ─────────────────────────────────────────────────────
// Full-featured modal so you don't have to touch RequestDetailModal if it's
// already used elsewhere. Pass onStatusChange up if you want it unified later.

const STATUS_FLOW: { label: string; value: string; color: string; bg: string; icon: React.ReactNode }[] = [
  {
    label: "Schedule",
    value: "Scheduled",
    color: "#1d4ed8",
    bg: "rgba(59,130,246,0.10)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: "Mark Arriving",
    value: "Arriving",
    color: "#0e7490",
    bg: "rgba(34,211,238,0.10)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
    ),
  },
  {
    label: "In Transit",
    value: "In Transit",
    color: "#7c3aed",
    bg: "rgba(168,85,247,0.10)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    label: "Complete",
    value: "Completed",
    color: "#3a6b00",
    bg: "rgba(184,213,46,0.12)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  {
    label: "Decline",
    value: "Declined",
    color: "#b91c1c",
    bg: "rgba(239,68,68,0.10)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
  },
];

// Which actions are valid from each status
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  Pending:      ["Scheduled", "Declined"],
  Scheduled:    ["Arriving", "Declined"],
  Arriving:     ["In Transit", "Declined"],
  "In Transit": ["Completed", "Declined"],
  Completed:    [],
  Declined:     [],
};

function RequestActionModal({
  item,
  onClose,
  onStatusChange,
}: {
  item: RequestItem | null;
  onClose: () => void;
  onStatusChange: (id: string, newDisplayStatus: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!item) return null;

  const allowed = ALLOWED_TRANSITIONS[item.status] ?? [];

  const handle = async (displayStatus: string) => {
    setLoading(displayStatus);
    try {
      await onStatusChange(item.id, displayStatus);
    } finally {
      setLoading(null);
    }
  };

  const statusCfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.Pending;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(10,26,15,0.45)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div style={{
        position: "fixed", inset: 0, zIndex: 51,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        pointerEvents: "none",
      }}>
        <div style={{
          pointerEvents: "auto",
          background: "#ffffff",
          borderRadius: 20,
          width: "100%", maxWidth: 480,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          fontFamily: "'Quicksand', sans-serif",
          overflow: "hidden",
        }}>
          {/* Modal header */}
          <div style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #f0f7f2",
            display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
          }}>
            <div>
              <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#9ab8a5", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
                {item.id.slice(0, 8).toUpperCase()}
              </p>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1a2e1f", margin: 0, lineHeight: 1.3 }}>
                {item.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#f0f7f2", border: "none", borderRadius: 8, cursor: "pointer",
                width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                color: "#4a7a5a", flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Details */}
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Status row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6b8f7a" }}>Current Status</span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                padding: "3px 10px", borderRadius: 999,
                background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusCfg.dot }} />
                {item.status}
              </span>
            </div>

            <div style={{ height: 1, background: "#f0f7f2" }} />

            {/* Info rows */}
            {[
              { label: "Waste Type", value: item.wasteType },
              { label: "Location", value: item.location },
              { label: "Collection Window", value: item.dates },
              { label: "Estimated Weight", value: item.weight },
              ...(item.contractorName ? [{ label: "Contractor", value: item.contractorName }] : []),
              ...(item.note ? [{ label: "Notes", value: item.note }] : []),
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8aab97", flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1a2e1f", textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          {allowed.length > 0 ? (
            <div style={{ padding: "12px 24px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8aab97", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Update Status
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {STATUS_FLOW.filter((a) => allowed.includes(a.value)).map((action) => (
                  <button
                    key={action.value}
                    onClick={() => handle(action.value)}
                    disabled={!!loading}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      padding: "11px 16px", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer",
                      background: action.value === "Declined" ? "#fef2f2" : action.bg,
                      color: action.color,
                      fontSize: "0.84rem", fontWeight: 700,
                      fontFamily: "'Quicksand', sans-serif",
                      opacity: loading && loading !== action.value ? 0.5 : 1,
                      transition: "opacity 0.15s, filter 0.15s",
                      filter: loading === action.value ? "brightness(0.92)" : "none",
                      outline: `1.5px solid ${action.color}22`,
                    }}
                  >
                    {loading === action.value ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14, animation: "wfSpin 0.8s linear infinite" }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Updating…
                      </>
                    ) : (
                      <>
                        {action.icon}
                        {action.label}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: "12px 24px 24px" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#8aab97", textAlign: "center" }}>
                No further actions available for this request.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function RequestsPage() {
  const [collapsed, setCollapsed]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab]     = useState("All");
  const [search, setSearch]           = useState("");
  const [requests, setRequests]       = useState<RequestItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedReq, setSelectedReq] = useState<RequestItem | null>(null);
  const [detailModalReq, setDetailModalReq] = useState<RequestItem | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "wasteRequests"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequests(
        snap.docs.map((d) =>
          mapDoc({ id: d.id, ...(d.data() as Omit<FirestoreRequest, "id">) })
        )
      );
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Update status via Firestore (admin role — rules now allow all statuses)
  const updateStatus = async (id: string, displayStatus: string) => {
    const firestoreValue = STATUS_WRITE[displayStatus];
    if (!firestoreValue) return;
    await updateDoc(doc(db, "wasteRequests", id), {
      status: firestoreValue,
      updatedAt: new Date().toISOString(),
    });
  };

  // After a status update, keep the action modal open with live data
  const liveSelectedReq = selectedReq
    ? requests.find((r) => r.id === selectedReq.id) ?? selectedReq
    : null;

  // Keep the old RequestDetailModal open with live data (if used elsewhere)
  const liveDetailModalReq = detailModalReq
    ? requests.find((r) => r.id === detailModalReq.id) ?? detailModalReq
    : null;

  const filtered = requests.filter((r) => {
    const matchTab = activeTab === "All" || r.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.title.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.wasteType.toLowerCase().includes(q) ||
      (r.contractorName && r.contractorName.toLowerCase().includes(q));
    return matchTab && matchSearch;
  });

  const counts = TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab] = tab === "All"
      ? requests.length
      : requests.filter((r) => r.status === tab).length;
    return acc;
  }, {});

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5faf6" }}>
        <style>{`@keyframes wfSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        <svg viewBox="0 0 24 24" fill="none" stroke="#1a4d2e" strokeWidth="2.5" style={{ width: 28, height: 28, animation: "wfSpin 0.8s linear infinite" }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');
        @keyframes wfSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
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

        .wf-topbar-right { display: flex; align-items: center; gap: 10px; }

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

        .wf-content {
          padding: 28px;
          display: flex; flex-direction: column; gap: 24px;
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

        .wf-tabs-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
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
        .wf-tab.active { background: #1a4d2e; color: #B8D52E; }

        .wf-tab-count {
          font-size: 0.65rem; font-weight: 700;
          padding: 1px 6px; border-radius: 999px;
          background: rgba(255,255,255,0.15); color: inherit;
        }
        .wf-tab:not(.active) .wf-tab-count { background: #f0f7f2; color: #8aab97; }

        .wf-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          align-items: start;
        }

        .wf-card:hover {
          box-shadow: 0 4px 20px rgba(26,77,46,0.1) !important;
          transform: translateY(-2px);
        }

        .wf-btn-view:hover { background: #B8D52E !important; color: #0d2416 !important; }

        .wf-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 64px 24px; gap: 12px; text-align: center;
        }

        @media (max-width: 1100px) { .wf-cards-grid { grid-template-columns: repeat(2, 1fr); } }

        @media (max-width: 768px) {
          .wf-hamburger { display: flex; }
          .wf-topbar { padding: 0 16px; }
          .wf-content { padding: 16px; gap: 16px; }
          .wf-cards-grid { grid-template-columns: 1fr; }
          .wf-filter-btn span { display: none; }
        }

        @media (max-width: 480px) { .wf-topbar-date { display: none; } }
      `}</style>

      <div className="wf-admin-root">
       <Sidebar
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
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <span className="wf-topbar-title">All Requests</span>
            </div>
            <div className="wf-topbar-right">
              <span
                style={{ fontSize: "0.75rem", color: "#8aab97", fontWeight: 600, fontFamily: "'Quicksand', sans-serif" }}
                className="wf-topbar-date"
              >
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
            <div className="wf-page-header">
              <h1>All Pickup Requests</h1>
              <p>Review and manage incoming pickup requests</p>
            </div>

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
                  placeholder="Search by title, location, waste type or contractor..."
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
                    onViewDetails={setSelectedReq}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Inline action modal — handles all status transitions */}
      <RequestActionModal
        item={liveSelectedReq}
        onClose={() => setSelectedReq(null)}
        onStatusChange={async (id, displayStatus) => {
          await updateStatus(id, displayStatus);
          // Keep modal open; liveSelectedReq will refresh via onSnapshot
        }}
      />

      {/* Existing RequestDetailModal — keep if used for read-only detail view */}
      <RequestDetailModal
        item={liveDetailModalReq}
        onClose={() => setDetailModalReq(null)}
        onAccept={(id) => updateStatus(id, "Scheduled")}
        onDecline={(id) => updateStatus(id, "Declined")}
      />
    </>
  );
}
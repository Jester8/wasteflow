"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, limit, doc, updateDoc, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useAuthGuard } from "../hooks/Useauthguard ";
import Sidebar from "../components/Sidebar";

type WasteRequest = {
  id: string;
  title: string;
  status: string;
  location: string;
  contractorName?: string;
  quantity?: string;
  wasteType?: string;
  createdAt?: string;
  windowStart?: string;
};

type NotificationItem = {
  id: string;
  requestId: string;
  requestTitle: string;
  newStatus: string;
  dates: string;
  location: string;
  createdAt: any;
  read: boolean;
};

const STATUS_DISPLAY: Record<string, string> = {
  pending:    "Pending",
  scheduled:  "Scheduled",
  arriving:   "Arriving",
  in_transit: "In Transit",
  completed:  "Completed",
  declined:   "Declined",
  cancelled:  "Cancelled",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function timeAgo(ts: any): string {
  if (!ts) return "";
  let date: Date;
  if (typeof ts?.toDate === "function") {
    date = ts.toDate();
  } else if (typeof ts === "object" && typeof ts.seconds === "number") {
    date = new Date(ts.seconds * 1000);
  } else {
    date = new Date(ts);
  }
  if (isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function StatCard({ label, value, sub, icon, accent = false, loading = false }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; accent?: boolean; loading?: boolean;
}) {
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
        {loading ? (
          <div style={{
            height: 32, width: 48, borderRadius: 8,
            background: accent ? "rgba(255,255,255,0.1)" : "#f0f7f2",
            animation: "wfPulse 1.4s ease-in-out infinite",
          }} />
        ) : (
          <div style={{
            fontSize: "1.8rem", fontWeight: 700,
            color: accent ? "#e8f5ee" : "#1a2e1f",
            lineHeight: 1, letterSpacing: "-0.02em",
          }}>{value}</div>
        )}
        {sub && !loading && (
          <div style={{
            fontSize: "0.72rem", fontWeight: 600,
            color: accent ? "#4a8a5a" : "#9ab8a5", marginTop: 5,
          }}>{sub}</div>
        )}
      </div>
    </div>
  );
}

const STATUS_ROW_STYLES: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  Pending:      { bg: "rgba(251,191,36,0.12)", color: "#b45309", border: "rgba(251,191,36,0.35)", dot: "#f59e0b" },
  Scheduled:    { bg: "rgba(59,130,246,0.10)", color: "#1d4ed8", border: "rgba(59,130,246,0.3)",  dot: "#3b82f6" },
  Arriving:     { bg: "rgba(34,211,238,0.10)", color: "#0e7490", border: "rgba(34,211,238,0.3)",  dot: "#06b6d4" },
  "In Transit": { bg: "rgba(168,85,247,0.10)", color: "#7c3aed", border: "rgba(168,85,247,0.3)", dot: "#a855f7" },
  Completed:    { bg: "rgba(184,213,46,0.12)", color: "#3a6b00", border: "rgba(184,213,46,0.35)", dot: "#B8D52E" },
  Declined:     { bg: "rgba(239,68,68,0.10)",  color: "#b91c1c", border: "rgba(239,68,68,0.25)", dot: "#ef4444" },
  Cancelled:    { bg: "rgba(239,68,68,0.10)",  color: "#b91c1c", border: "rgba(239,68,68,0.25)", dot: "#ef4444" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_ROW_STYLES[status] || STATUS_ROW_STYLES.Pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase",
      padding: "3px 9px", borderRadius: 999,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontFamily: "'Quicksand', sans-serif", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

const KYC_BADGE_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  pending:   { bg: "rgba(184,213,46,0.12)", color: "#5a8a1a", border: "rgba(184,213,46,0.3)", label: "KYC Pending" },
  submitted: { bg: "rgba(59,130,246,0.08)", color: "#2563eb", border: "rgba(59,130,246,0.2)", label: "Under Review" },
  approved:  { bg: "rgba(26,77,46,0.08)",   color: "#1a4d2e", border: "rgba(26,77,46,0.2)",  label: "Verified" },
  rejected:  { bg: "rgba(224,92,92,0.08)",  color: "#c0392b", border: "rgba(224,92,92,0.2)", label: "Rejected" },
};

function KycStatusBadge({ status }: { status: string }) {
  const s = KYC_BADGE_STYLES[status] || KYC_BADGE_STYLES.pending;
  return (
    <span style={{
      fontSize: "0.7rem", fontWeight: 700,
      padding: "4px 12px", borderRadius: 999,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontFamily: "'Quicksand', sans-serif",
      letterSpacing: "0.02em", whiteSpace: "nowrap",
      display: "inline-flex", alignItems: "center",
    }}>{s.label}</span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[80, 120, 140, 70, 90, 70, 50].map((w, i) => (
        <td key={i} style={{ padding: "13px 18px" }}>
          <div style={{
            height: 13, width: w, borderRadius: 6,
            background: "#f0f7f2", animation: "wfPulse 1.4s ease-in-out infinite",
          }} />
        </td>
      ))}
    </tr>
  );
}

const NOTIF_STATUS_CONFIG: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  Scheduled: {
    bg: "rgba(59,130,246,0.10)", color: "#1d4ed8",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  Arriving: {
    bg: "rgba(34,211,238,0.10)", color: "#0e7490",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
    ),
  },
  "In Transit": {
    bg: "rgba(168,85,247,0.10)", color: "#7c3aed",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  Completed: {
    bg: "rgba(184,213,46,0.12)", color: "#3a6b00",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  Declined: {
    bg: "rgba(239,68,68,0.10)", color: "#b91c1c",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
  },
};

function NotificationPanel({
  notifications,
  open,
  onClose,
  onMarkAllRead,
}: {
  notifications: NotificationItem[];
  open: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
}) {
  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 90 }}
      />
      <div style={{
        position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 91,
        width: 340, maxHeight: 420,
        background: "#ffffff", border: "1px solid #e8f2eb",
        borderRadius: 16, boxShadow: "0 16px 40px rgba(0,0,0,0.16)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        fontFamily: "'Quicksand', sans-serif",
      }}>
        <div style={{
          padding: "14px 16px", borderBottom: "1px solid #f0f7f2",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a2e1f" }}>Notifications</span>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={onMarkAllRead}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.7rem", fontWeight: 700, color: "#1a4d2e",
                fontFamily: "'Quicksand', sans-serif",
              }}
            >
              Mark all read
            </button>
          )}
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {notifications.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ab8a5", margin: 0 }}>
                No notifications yet
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const cfg = NOTIF_STATUS_CONFIG[n.newStatus] || NOTIF_STATUS_CONFIG.Scheduled;
              return (
                <div
                  key={n.id}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f5faf6",
                    display: "flex", gap: 10, alignItems: "flex-start",
                    background: n.read ? "transparent" : "rgba(184,213,46,0.05)",
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: cfg.bg, color: cfg.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1a2e1f", margin: 0, lineHeight: 1.4 }}>
                      "{n.requestTitle}" {n.newStatus.toLowerCase()}
                    </p>
                    {n.dates && (
                      <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#6b8f7a", margin: "3px 0 0", lineHeight: 1.4 }}>
                        {n.dates}
                      </p>
                    )}
                    <p style={{ fontSize: "0.68rem", fontWeight: 600, color: "#9ab8a5", margin: "4px 0 0" }}>
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <span style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "#B8D52E", flexShrink: 0, marginTop: 4,
                    }} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default function OperatorDashboard() {
  const [collapsed, setCollapsed]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut]   = useState(false);
  const [requests, setRequests]       = useState<WasteRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);

  const router = useRouter();
  const { user: authUser, profile: authProfile } = useAuth();
  
  const { user, profile, loading: authGuardLoading } = useAuthGuard("auth-only", "operator");

  useEffect(() => {
    if (authGuardLoading) return;
    if (!user || !profile) return;
    
    if (!profile.kycStatus) {
      router.replace("/kyc");
      return;
    }
    
    if (profile.role !== "operator") {
      router.replace("/contractor/");
      return;
    }
  }, [profile, user, authGuardLoading, router]);

  useEffect(() => {
    if (!user || !profile) return;
    if (!profile.kycStatus) return;
    if (profile.role !== "operator") return;

    const q = query(
      collection(db, "wasteRequests"),
      where("assignedOperatorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setRequests(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<WasteRequest, "id">),
        }))
      );
      setDataLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setDataLoading(false);
    });

    return () => unsub();
  }, [user, profile]);

  // Notifications temporarily disabled
  // useEffect(() => {
  //   if (!user || !profile) return;
  //   if (!profile.kycStatus) return;
  //   if (profile.role !== "operator") return;
  //
  //   const q = query(
  //     collection(db, "notifications", user.uid, "items"),
  //     orderBy("createdAt", "desc"),
  //     limit(25)
  //   );
  //
  //   const unsub = onSnapshot(q, (snap) => {
  //     setNotifications(
  //       snap.docs.map((d) => ({
  //         id: d.id,
  //         ...(d.data() as Omit<NotificationItem, "id">),
  //       }))
  //     );
  //   }, (err) => {
  //     console.error("Notifications error:", err);
  //   });
  //
  //   return () => unsub();
  // }, [user, profile]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // async function markAllNotificationsRead() {
  //   const unread = notifications.filter((n) => !n.read);
  //   if (unread.length === 0) return;
  //   try {
  //     const batch = writeBatch(db);
  //     unread.forEach((n) => {
  //       batch.update(doc(db, "notifications", user?.uid, "items", n.id), { read: true });
  //     });
  //     await batch.commit();
  //   } catch (err) {
  //     console.error("Failed to mark notifications read:", err);
  //   }
  // }

  const markAllNotificationsRead = async () => {
    // Temporarily disabled
    console.log("Mark all notifications read - temporarily disabled");
  };

  if (authGuardLoading) return <Spinner />;
  
  if (!user || !profile) return <Spinner />;
  
  if (!profile.kycStatus || profile.role !== "operator") {
    return null;
  }

  const total     = requests.length;
  const pending   = requests.filter((r) => r.status === "pending").length;
  const active    = requests.filter((r) =>
    ["scheduled", "arriving", "in_transit"].includes(r.status)
  ).length;
  const completed = requests.filter((r) => r.status === "completed").length;

  const recent = requests.slice(0, 8);

  const displayName  = profile?.fullName || authUser?.email?.split("@")[0] || "Operator";
  const displayEmail = profile?.email || authUser?.email || "";
  const kycStatus    = profile?.kycStatus || "pending";

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
        @keyframes wfSpin   { from { transform: rotate(0deg); }  to { transform: rotate(360deg); } }
        @keyframes wfPulse  { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .wf-admin-root { display: flex; min-height: 100vh; background: #f5faf6; font-family: 'Quicksand', sans-serif; }
        .wf-admin-main { flex: 1; min-width: 0; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; }
        .wf-topbar { position: sticky; top: 0; z-index: 10; background: rgba(245,250,246,0.92); backdrop-filter: blur(10px); border-bottom: 1px solid #e8f2eb; padding: 0 28px; height: 60px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .wf-topbar-left { display: flex; align-items: center; gap: 14px; }
        .wf-hamburger { display: none; background: none; border: none; cursor: pointer; color: #1a4d2e; padding: 6px; border-radius: 8px; align-items: center; justify-content: center; transition: background 0.18s; flex-shrink: 0; }
        .wf-hamburger:hover { background: rgba(184,213,46,0.12); }
        .wf-topbar-title { font-size: 1rem; font-weight: 700; color: #1a2e1f; font-family: 'Quicksand', sans-serif; }
        .wf-topbar-right { display: flex; align-items: center; gap: 10px; position: relative; }
        .wf-topbar-date { font-size: 0.75rem; color: #8aab97; font-weight: 600; font-family: 'Quicksand', sans-serif; }
        .wf-notif-wrap { position: relative; }
        .wf-notif-btn { width: 34px; height: 34px; border-radius: 9px; background: #ffffff; border: 1px solid #e8f2eb; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #4a7a5a; position: relative; transition: border 0.18s, color 0.18s; }
        .wf-notif-btn:hover { border-color: #B8D52E; color: #1a4d2e; }
        .wf-notif-dot { position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; border-radius: 50%; background: #B8D52E; border: 1.5px solid #f5faf6; }
        .wf-notif-badge { position: absolute; top: -5px; right: -5px; min-width: 17px; height: 17px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 0.62rem; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 1.5px solid #f5faf6; padding: 0 3px; font-family: 'Quicksand', sans-serif; }
        .wf-content { padding: 28px; display: flex; flex-direction: column; gap: 28px; }
        .wf-greeting h1 { font-size: clamp(1.2rem, 2vw, 1.5rem); font-weight: 700; color: #1a2e1f; letter-spacing: -0.02em; margin-bottom: 4px; font-family: 'Quicksand', sans-serif; }
        .wf-greeting p { font-size: 0.875rem; color: #6b8f7a; font-weight: 600; font-family: 'Quicksand', sans-serif; }
        .wf-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        @media (min-width: 900px) { .wf-stats-grid { grid-template-columns: repeat(4, 1fr); } }
        .wf-table-card { background: #ffffff; border: 1px solid #e8f2eb; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .wf-table-header { padding: 18px 22px 14px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f0f7f2; }
        .wf-table-title { font-size: 0.9rem; font-weight: 700; color: #1a2e1f; font-family: 'Quicksand', sans-serif; }
        .wf-view-all { font-size: 0.75rem; font-weight: 700; color: #1a4d2e; text-decoration: none; font-family: 'Quicksand', sans-serif; display: flex; align-items: center; gap: 4px; transition: color 0.18s; }
        .wf-view-all:hover { color: #B8D52E; }
        .wf-table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        thead th { padding: 11px 18px; text-align: left; font-size: 0.68rem; font-weight: 700; color: #8aab97; text-transform: uppercase; letter-spacing: 0.08em; font-family: 'Quicksand', sans-serif; background: #fafcfa; border-bottom: 1px solid #f0f7f2; white-space: nowrap; }
        tbody tr { border-bottom: 1px solid #f5faf6; transition: background 0.15s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: #fafcfa; }
        tbody td { padding: 13px 18px; font-size: 0.82rem; font-weight: 600; color: #2a4a35; font-family: 'Quicksand', sans-serif; white-space: nowrap; }
        .wf-id-cell { font-size: 0.72rem; color: #8aab97; font-weight: 700; font-family: 'Quicksand', sans-serif; letter-spacing: 0.04em; }
        .wf-action-btn { background: none; border: 1px solid #e8f2eb; border-radius: 7px; padding: 5px 12px; font-size: 0.72rem; font-weight: 700; color: #1a4d2e; cursor: pointer; font-family: 'Quicksand', sans-serif; transition: background 0.18s, border 0.18s, color 0.18s; }
        .wf-action-btn:hover { background: #1a4d2e; border-color: #1a4d2e; color: #e8f5ee; }
        @media (max-width: 768px) { .wf-hamburger { display: flex; } .wf-topbar { padding: 0 16px; } .wf-topbar-date { display: none; } .wf-content { padding: 16px; gap: 16px; } }
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
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <span className="wf-topbar-title">Operator Dashboard</span>
            </div>
            <div className="wf-topbar-right">
              <span className="wf-topbar-date">
                {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </span>
              <div className="wf-notif-wrap">
                <button
                  className="wf-notif-btn"
                  aria-label="Notifications"
                  onClick={() => setNotifPanelOpen((o) => !o)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {unreadCount > 0 ? (
                    <span className="wf-notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                  ) : (
                    <span className="wf-notif-dot" />
                  )}
                </button>
                <NotificationPanel
                  notifications={notifications}
                  open={notifPanelOpen}
                  onClose={() => setNotifPanelOpen(false)}
                  onMarkAllRead={markAllNotificationsRead}
                />
              </div>
            </div>
          </div>

          <div className="wf-content">
            <div className="wf-greeting" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <h1>{getGreeting()}, {displayName.split(" ")[0]} 👋</h1>
                <p>Here's what's happening on WasteFlow today.</p>
              </div>
              <KycStatusBadge status={kycStatus} />
            </div>

            {kycStatus === "rejected" && (
              <div style={{
                background: "#fff5f5", border: "1px solid #f5c6c6", borderRadius: 12,
                padding: "14px 18px", marginBottom: 20, fontFamily: "'Quicksand', sans-serif",
              }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "#c0392b", margin: 0 }}>
                  Your KYC application was rejected
                </p>
                <p style={{ fontSize: "0.8rem", color: "#6b8f7a", margin: "4px 0 0" }}>
                  {profile?.kycRejectionReason || "Contact WasteFlow support for more details."}
                  {" "}You can't accept or manage pickup requests until this is resolved.
                </p>
              </div>
            )}

            <div className="wf-stats-grid">
              <StatCard
                label="Total Requests" value={total} accent loading={dataLoading}
                sub={total === 1 ? "1 request on platform" : `${total} requests on platform`}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
              />
              <StatCard
                label="Pending" value={pending} loading={dataLoading}
                sub="Awaiting scheduling"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              />
              <StatCard
                label="Active Pickups" value={active} loading={dataLoading}
                sub="Scheduled · Arriving · In Transit"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
              />
              <StatCard
                label="Completed" value={completed} loading={dataLoading}
                sub="All time"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              />
            </div>

            <div className="wf-table-card">
              <div className="wf-table-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="wf-table-title">Recent Requests</span>
                  {!dataLoading && (
                    <span style={{
                      fontSize: "0.65rem", fontWeight: 700, color: "#8aab97",
                      background: "#f0f7f2", borderRadius: 999, padding: "2px 8px",
                      fontFamily: "'Quicksand', sans-serif",
                    }}>{recent.length} of {total}</span>
                  )}
                </div>
                <a href="/operators/requests" className="wf-view-all">
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
                      <th>ID</th>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Waste Type</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataLoading ? (
                      Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : recent.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "40px 18px" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                            <div style={{
                              width: 40, height: 40, borderRadius: 10,
                              background: "#f0f7f2", display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#9ab8a5",
                            }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                              </svg>
                            </div>
                            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#6b8f7a", fontFamily: "'Quicksand', sans-serif" }}>
                              No requests yet
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "#9ab8a5", fontWeight: 600, fontFamily: "'Quicksand', sans-serif" }}>
                              Requests from contractors will appear here
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      recent.map((req) => {
                        const displayStatus = STATUS_DISPLAY[req.status] ?? "Pending";
                        return (
                          <tr key={req.id}>
                            <td><span className="wf-id-cell">{req.id.slice(0, 8).toUpperCase()}</span></td>
                            <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {req.title || "—"}
                            </td>
                            <td style={{ color: "#6b8f7a", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {req.location || "—"}
                            </td>
                            <td style={{ color: "#6b8f7a" }}>{req.wasteType || "—"}</td>
                            <td style={{ color: "#8aab97" }}>{formatDate(req.createdAt)}</td>
                            <td><StatusBadge status={displayStatus} /></td>
                            <td>
                              <a href="/operators/requests" style={{ textDecoration: "none" }}>
                                <button className="wf-action-btn">Review</button>
                              </a>
                            </td>
                          </tr>
                        );
                      })
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

function Spinner() {
  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5faf6" }}>
      <style>{`@keyframes wfSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <svg viewBox="0 0 24 24" fill="none" stroke="#1a4d2e" strokeWidth="2.5" style={{ width: 28, height: 28, animation: "wfSpin 0.8s linear infinite" }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  );
}
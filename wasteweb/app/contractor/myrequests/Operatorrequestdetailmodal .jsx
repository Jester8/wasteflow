"use client";

import { useEffect, useState } from "react";

const STATUS_CONFIG = {
  "Awaiting Approval": { bg: "rgba(251,191,36,0.12)",  color: "#b45309", border: "rgba(251,191,36,0.35)",  dot: "#f59e0b",  label: "Awaiting Approval" },
  Scheduled:           { bg: "rgba(59,130,246,0.10)",  color: "#1d4ed8", border: "rgba(59,130,246,0.3)",   dot: "#3b82f6",  label: "Scheduled"         },
  Arriving:            { bg: "rgba(34,211,238,0.10)",  color: "#0e7490", border: "rgba(34,211,238,0.3)",   dot: "#06b6d4",  label: "Arriving"          },
  "In Transit":        { bg: "rgba(168,85,247,0.10)",  color: "#7c3aed", border: "rgba(168,85,247,0.3)",   dot: "#a855f7",  label: "In Transit"        },
  Completed:           { bg: "rgba(184,213,46,0.12)",  color: "#3a6b00", border: "rgba(184,213,46,0.35)",  dot: "#B8D52E",  label: "Completed"         },
  Declined:            { bg: "rgba(239,68,68,0.10)",   color: "#b91c1c", border: "rgba(239,68,68,0.25)",   dot: "#ef4444",  label: "Declined"          },
};

const WASTE_TYPE_CONFIG = {
  Mixed:     { bg: "rgba(168,85,247,0.10)",  color: "#7c3aed", border: "rgba(168,85,247,0.25)"  },
  Metal:     { bg: "rgba(100,116,139,0.10)", color: "#475569", border: "rgba(100,116,139,0.25)" },
  Concrete:  { bg: "rgba(120,113,108,0.10)", color: "#57534e", border: "rgba(120,113,108,0.25)" },
  Green:     { bg: "rgba(34,197,94,0.10)",   color: "#15803d", border: "rgba(34,197,94,0.25)"   },
  Hazardous: { bg: "rgba(239,68,68,0.10)",   color: "#b91c1c", border: "rgba(239,68,68,0.25)"   },
  General:   { bg: "rgba(59,130,246,0.10)",  color: "#1d4ed8", border: "rgba(59,130,246,0.25)"  },
};

const STATUS_STEPS = {
  "Awaiting Approval": [true,  false, false, false],
  Scheduled:           [true,  true,  false, false],
  Arriving:            [true,  true,  true,  false],
  "In Transit":        [true,  true,  true,  false],
  Completed:           [true,  true,  true,  true ],
  Declined:            [true,  false, false, false],
};

const TIMELINE_STEPS = [
  { label: "Request submitted",    sub: "You raised this pickup request"       },
  { label: "Accepted by operator", sub: "An operator confirmed the job"        },
  { label: "Pickup in progress",   sub: "An operator is collecting the waste"  },
  { label: "Completed",            sub: "Waste successfully collected"         },
];

const BANNERS = {
  "Awaiting Approval": {
    iconStroke: "#f59e0b",
    iconPath: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    iconBg: "#fffbeb", iconBorder: "rgba(251,191,36,0.35)",
    title: "Awaiting Approval",
    sub: "Your request has been submitted and is waiting to be accepted",
  },
  Scheduled: {
    iconStroke: "#3b82f6",
    iconPath: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    iconBg: "rgba(59,130,246,0.08)", iconBorder: "rgba(59,130,246,0.25)",
    title: "Pickup Scheduled",
    sub: "An operator has accepted your request and will arrive soon",
  },
  Arriving: {
    iconStroke: "#06b6d4",
    iconPath: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    iconBg: "rgba(34,211,238,0.08)", iconBorder: "rgba(34,211,238,0.25)",
    title: "Operator On the Way",
    sub: "Your operator is en route to the pickup location",
  },
  "In Transit": {
    iconStroke: "#a855f7",
    iconPath: <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
    iconBg: "rgba(168,85,247,0.08)", iconBorder: "rgba(168,85,247,0.25)",
    title: "Pickup In Progress",
    sub: "Waste is being collected and transported",
  },
  Completed: {
    iconStroke: "#B8D52E",
    iconPath: <polyline points="20 6 9 17 4 12"/>,
    iconBg: "#1a4d2e", iconBorder: "transparent",
    title: "Pickup Completed",
    sub: "Your waste has been successfully collected — nice work!",
  },
  Declined: {
    iconStroke: "#ef4444",
    iconPath: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    iconBg: "rgba(239,68,68,0.08)", iconBorder: "rgba(239,68,68,0.25)",
    title: "Request Declined",
    sub: "No contractor accepted this request. You can submit a new one.",
  },
};

function XIcon({ size = 15 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function CheckIcon({ size = 14 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function CalIcon({ color = "currentColor", size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG["Awaiting Approval"];
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
      {s.label}
    </span>
  );
}

function WasteTypeBadge({ type }) {
  const c = WASTE_TYPE_CONFIG[type] || WASTE_TYPE_CONFIG.General;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: "0.7rem", fontWeight: 600,
      padding: "4px 10px", borderRadius: 999,
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

function DetailRow({ label, icon, value, valueColor, last }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 4,
      padding: "13px 0",
      borderBottom: last ? "none" : "1px solid #f0f7f2",
    }}>
      <span style={{
        fontSize: "0.68rem", fontWeight: 700, color: "#9ab8a5",
        fontFamily: "'Quicksand', sans-serif",
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#8aab97", flexShrink: 0, display: "flex", alignItems: "center" }}>
          {icon}
        </span>
        <span style={{
          fontSize: "0.88rem", fontWeight: 600,
          color: valueColor || "#1a2e1f",
          fontFamily: "'Quicksand', sans-serif",
          lineHeight: 1.45,
          wordBreak: "break-word",
        }}>{value}</span>
      </div>
    </div>
  );
}

function StatusBanner({ status }) {
  const b = BANNERS[status] || BANNERS["Awaiting Approval"];
  return (
    <div style={{
      background: "#f5faf6", border: "1px solid #e8f2eb",
      borderRadius: 12, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      marginBottom: 4,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: b.iconBg, border: `1px solid ${b.iconBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={b.iconStroke} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
          {b.iconPath}
        </svg>
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontSize: "0.78rem", fontWeight: 700, color: "#1a2e1f",
          fontFamily: "'Quicksand', sans-serif", margin: 0,
        }}>{b.title}</p>
        <p style={{
          fontSize: "0.72rem", fontWeight: 600, color: "#6b8f7a",
          fontFamily: "'Quicksand', sans-serif", margin: "2px 0 0",
        }}>{b.sub}</p>
      </div>
    </div>
  );
}

function Timeline({ status }) {
  const steps    = STATUS_STEPS[status] || STATUS_STEPS["Awaiting Approval"];
  const declined = status === "Declined";
  return (
    <div style={{ paddingTop: 20 }}>
      <p style={{
        fontSize: "0.68rem", fontWeight: 700, color: "#9ab8a5",
        fontFamily: "'Quicksand', sans-serif",
        textTransform: "uppercase", letterSpacing: "0.06em",
        marginBottom: 14,
      }}>
        Request Timeline
      </p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {TIMELINE_STEPS.map((step, i, arr) => {
          const done     = steps[i];
          const isDenied = declined && i > 0;
          const isLast   = i === arr.length - 1;
          return (
            <div key={i} style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: isDenied ? "rgba(239,68,68,0.08)" : done ? "#1a4d2e" : "#f0f7f2",
                  border: isDenied ? "2px solid rgba(239,68,68,0.3)" : done ? "2px solid #1a4d2e" : "2px solid #c6e2d0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: 2,
                }}>
                  {isDenied ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3"
                      strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  ) : done ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="3"
                      strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : null}
                </div>
                {!isLast && (
                  <div style={{
                    width: 2, flex: 1, minHeight: 24,
                    background: done && !isDenied ? "#1a4d2e" : "#e8f2eb",
                    margin: "3px 0",
                  }} />
                )}
              </div>
              <div style={{ paddingBottom: isLast ? 0 : 16, paddingTop: 2, minWidth: 0 }}>
                <p style={{
                  fontSize: "0.82rem", fontWeight: 700, margin: 0,
                  color: isDenied ? "#b91c1c" : done ? "#1a2e1f" : "#9ab8a5",
                  fontFamily: "'Quicksand', sans-serif",
                }}>
                  {step.label}
                </p>
                <p style={{
                  fontSize: "0.74rem", fontWeight: 600, margin: "2px 0 0",
                  color: isDenied ? "rgba(185,28,28,0.6)" : "#8aab97",
                  fontFamily: "'Quicksand', sans-serif",
                }}>
                  {isDenied ? "Not applicable — request was declined" : step.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- OPENSTREETMAP LIVE TRACKING --- */
function LiveTrackingSection({ item }) {
  const [eta, setEta] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 12));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const lat = item?.latitude || -33.8688;
  const lon = item?.longitude || 151.2093;

  return (
    <div style={{
      marginTop: 20, paddingTop: 20, borderTop: "1px solid #f0f7f2"
    }}>
      <div style={{
        display: "flex", flexWrap: "wrap", justifyContent: "space-between",
        alignItems: "center", gap: 10, marginBottom: 12,
      }}>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: "0.68rem", fontWeight: 700, color: "#a855f7",
            fontFamily: "'Quicksand', sans-serif",
            textTransform: "uppercase", letterSpacing: "0.06em", margin: 0
          }}>
            🔴 Live Operator Tracking
          </p>
          <p style={{
            fontSize: "0.74rem", fontWeight: 600, color: "#6b8f7a",
            fontFamily: "'Quicksand', sans-serif", margin: "2px 0 0"
          }}>
            Truck is currently en-route to your destination
          </p>
        </div>
        <div style={{
          background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
          padding: "4px 10px", borderRadius: 8, textAlign: "right", flexShrink: 0,
        }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#7c3aed", margin: 0, textTransform: "uppercase" }}>Est. Arrival</p>
          <p style={{ fontSize: "0.9rem", fontWeight: 800, color: "#1a2e1f", margin: 0, fontFamily: "'Quicksand', sans-serif" }}>{eta} mins</p>
        </div>
      </div>

      <div style={{
        width: "100%", aspectRatio: "16 / 9", maxHeight: 220, borderRadius: 12, overflow: "hidden",
        border: "1px solid #e8f2eb", background: "#f5faf6", position: "relative"
      }}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          loading="lazy"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01}%2C${lat-0.005}%2C${lon+0.01}%2C${lat+0.005}&layer=mapnik&marker=${lat}%2C${lon}`}
          style={{ border: "none", display: "block" }}
        />
        <div style={{
          position: "absolute", bottom: 8, right: 8, background: "rgba(255,255,255,0.9)",
          padding: "3px 8px", borderRadius: 4, fontSize: "0.6rem", fontWeight: 600, color: "#4a7a5a",
          border: "1px solid #e8f2eb", fontFamily: "sans-serif"
        }}>
          © OpenStreetMap contributors
        </div>
      </div>
    </div>
  );
}

function AcceptanceConfirmModal({ item, onClose, onAccept, onReschedule }) {
  const [view, setView] = useState("confirm");
  const [reschedule, setReschedule] = useState({ date: "", fromTime: "", toTime: "", note: "" });
  const [submitting, setSubmitting] = useState(false);

  const driverName = item?.operatorName || "Your skip driver";
  const driverInitials = driverName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  async function handleAccept() {
    setSubmitting(true);
    try {
      await onAccept?.(item);
      setView("success");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRescheduleSend() {
    setSubmitting(true);
    try {
      await onReschedule?.(item, reschedule);
      setView("reschedule-sent");
    } finally {
      setSubmitting(false);
    }
  }

  const canSendReschedule = reschedule.date && reschedule.fromTime && reschedule.toTime;

  return (
    <>
      <style>{`
        @keyframes acBackdropIn { from{opacity:0} to{opacity:1} }
        @keyframes acModalIn    { from{opacity:0;transform:scale(0.93) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes acRingPop    { 0%{transform:scale(0)} 60%{transform:scale(1.18)} 100%{transform:scale(1)} }
        @keyframes acSpinner    { to{transform:rotate(360deg)} }

        .ac-backdrop {
          position:fixed; inset:0; z-index:500;
          background:rgba(10,22,13,0.55);
          backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center;
          padding:16px;
          box-sizing:border-box;
          animation:acBackdropIn 0.2s ease both;
        }
        .ac-modal {
          background:#fff; border-radius:18px;
          width:100%; max-width:400px;
          max-height:calc(100dvh - 32px);
          overflow-y:auto;
          box-shadow:0 12px 48px rgba(0,0,0,0.22);
          animation:acModalIn 0.28s cubic-bezier(0.22,1,0.36,1) both;
        }
        .ac-header {
          padding:16px 18px 14px;
          border-bottom:1px solid #f0f7f2;
          display:flex; align-items:flex-start; justify-content:space-between; gap:12px;
        }
        .ac-icon {
          width:44px; height:44px; border-radius:12px;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .ac-close {
          width:30px; height:30px; border-radius:8px;
          background:#f5faf6; border:1px solid #e8f2eb;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:#4a7a5a; flex-shrink:0;
          transition:background 0.15s, border-color 0.15s, color 0.15s;
        }
        .ac-close:hover { background:#fee2e2; border-color:#fca5a5; color:#b91c1c; }
        .ac-body { padding:16px 18px; display:flex; flex-direction:column; gap:12px; }
        .ac-footer { padding:0 18px 18px; display:flex; flex-direction:column; gap:8px; }
        .ac-btn-primary {
          width:100%; padding:11px 16px; border-radius:10px;
          background:#1a4d2e; border:none; cursor:pointer;
          color:#B8D52E; font-size:0.88rem; font-weight:700;
          font-family:'Quicksand',sans-serif;
          display:flex; align-items:center; justify-content:center; gap:7px;
          transition:background 0.15s, color 0.15s;
        }
        .ac-btn-primary:disabled { opacity:0.65; cursor:not-allowed; }
        .ac-btn-primary:hover:not(:disabled) { background:#B8D52E; color:#0d2416; }
        .ac-btn-secondary {
          width:100%; padding:11px 16px; border-radius:10px;
          background:none; border:1px solid #e8f2eb; cursor:pointer;
          color:#1a4d2e; font-size:0.88rem; font-weight:700;
          font-family:'Quicksand',sans-serif;
          display:flex; align-items:center; justify-content:center; gap:7px;
          transition:background 0.15s, border-color 0.15s;
        }
        .ac-btn-secondary:hover { background:#f0f7f2; border-color:#B8D52E; }
        .ac-field-label {
          font-size:0.68rem; font-weight:700; color:#9ab8a5;
          text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px;
          font-family:'Quicksand',sans-serif; display:block;
        }
        .ac-input {
          width:100%; padding:9px 11px; border-radius:8px;
          border:1.5px solid #e8f2eb; background:#fff;
          font-size:16px; font-weight:600; color:#1a2e1f;
          font-family:'Quicksand',sans-serif; outline:none;
          transition:border 0.15s, box-shadow 0.15s;
          box-sizing:border-box; color-scheme:light;
        }
        .ac-input:focus { border-color:#B8D52E; box-shadow:0 0 0 3px rgba(184,213,46,0.12); }
        .ac-textarea {
          width:100%; padding:9px 11px; border-radius:8px;
          border:1.5px solid #e8f2eb; background:#fff;
          font-size:16px; font-weight:600; color:#1a2e1f;
          font-family:'Quicksand',sans-serif; outline:none; resize:none; min-height:72px;
          transition:border 0.15s, box-shadow 0.15s; box-sizing:border-box;
        }
        .ac-textarea:focus { border-color:#B8D52E; box-shadow:0 0 0 3px rgba(184,213,46,0.12); }
        .ac-success-ring {
          width:64px; height:64px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          animation:acRingPop 0.4s cubic-bezier(0.22,1,0.36,1) 0.05s both;
        }
        .ac-spinner {
          width:15px; height:15px; border-radius:50%;
          border:2px solid rgba(184,213,46,0.35); border-top-color:#B8D52E;
          animation:acSpinner 0.7s linear infinite;
        }
        .ac-back-btn {
          background:none; border:none; cursor:pointer;
          font-size:0.78rem; font-weight:700; color:#6b8f7a;
          font-family:'Quicksand',sans-serif;
          display:flex; align-items:center; gap:5px; padding:0;
        }
        .ac-back-btn:hover { color:#1a4d2e; }
        .ac-info-card {
          background:#f5faf6; border:1px solid #e8f2eb;
          border-radius:10px; padding:12px 14px;
          display:flex; flex-direction:column; gap:8px;
        }
        .ac-info-divider { height:1px; background:#e8f2eb; margin:2px 0; }
        .ac-info-label {
          font-size:0.68rem; font-weight:700; color:#9ab8a5;
          text-transform:uppercase; letter-spacing:0.05em;
          font-family:'Quicksand',sans-serif; margin:0 0 2px;
        }
        .ac-info-val {
          font-size:0.85rem; font-weight:700; color:#1a2e1f;
          font-family:'Quicksand',sans-serif; margin:0;
          word-break:break-word;
        }
        .ac-driver-card {
          display:flex; align-items:center; gap:10px;
          background:rgba(184,213,46,0.08); border:1px solid rgba(184,213,46,0.25);
          border-radius:10px; padding:10px 13px;
        }
        .ac-driver-avatar {
          width:36px; height:36px; border-radius:50%;
          background:#1a4d2e; color:#B8D52E;
          display:flex; align-items:center; justify-content:center;
          font-size:0.72rem; font-weight:800; flex-shrink:0;
          font-family:'Quicksand',sans-serif;
        }
        .ac-two-col { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        @media (max-width:420px) { .ac-two-col { grid-template-columns:1fr; } }

        @media (max-width:480px) {
          .ac-backdrop { padding:0; align-items:flex-end; }
          .ac-modal {
            max-width:100%; width:100%;
            border-radius:18px 18px 0 0;
            max-height:88dvh;
          }
        }
      `}</style>

      <div
        className="ac-backdrop"
        onClick={(e) => {
          if (e.target === e.currentTarget && !submitting) onClose?.();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Pickup acceptance"
      >
        <div className="ac-modal">

          {view === "confirm" && (
            <>
              <div className="ac-header">
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0 }}>
                  <div className="ac-icon" style={{ background: "#f0fdf4", border: "1px solid rgba(34,197,94,0.25)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: "0.95rem", fontWeight: 800, color: "#1a2e1f",
                      fontFamily: "'Quicksand', sans-serif", lineHeight: 1.3, margin: 0,
                    }}>
                      Your request has been accepted by an operator
                    </p>
                    <p style={{
                      fontSize: "0.73rem", fontWeight: 600, color: "#6b8f7a",
                      fontFamily: "'Quicksand', sans-serif", marginTop: 3,
                    }}>
                      Review the proposed schedule and confirm or reschedule
                    </p>
                  </div>
                </div>
                <button className="ac-close" onClick={onClose} disabled={submitting}>
                  <XIcon size={13} />
                </button>
              </div>

              <div className="ac-body">
                <div className="ac-driver-card">
                  <div className="ac-driver-avatar">{driverInitials}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: "0.85rem", fontWeight: 700, color: "#1a2e1f",
                      fontFamily: "'Quicksand', sans-serif", margin: 0,
                    }}>
                      {driverName}
                    </p>
                    <p style={{
                      fontSize: "0.7rem", fontWeight: 600, color: "#6b8f7a",
                      fontFamily: "'Quicksand', sans-serif", margin: 0,
                    }}>
                      {item.driverRating ? `${item.driverRating}★ · ` : ""}Operator
                    </p>
                  </div>
                </div>

                <div className="ac-info-card">
                  {[
                    { label: "Proposed pickup date",  val: item.proposedDate || item.dates        },
                    { label: "Proposed time window",  val: item.proposedTime || item.availability },
                    { label: "Location",              val: item.location                          },
                  ].map(({ label, val }, i, arr) => val && (
                    <div key={label}>
                      <p className="ac-info-label">{label}</p>
                      <p className="ac-info-val">{val}</p>
                      {i < arr.length - 1 && <div className="ac-info-divider" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="ac-footer">
                <button className="ac-btn-primary" onClick={handleAccept} disabled={submitting}>
                  {submitting
                    ? <><div className="ac-spinner" /> Confirming…</>
                    : <><CheckIcon /> Accept pickup</>
                  }
                </button>
                <button className="ac-btn-secondary" onClick={() => setView("reschedule")} disabled={submitting}>
                  <CalIcon size={15} /> Request reschedule
                </button>
              </div>
            </>
          )}

          {view === "reschedule" && (
            <>
              <div className="ac-header">
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0 }}>
                  <div className="ac-icon" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)" }}>
                    <CalIcon color="#3b82f6" size={22} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: "0.95rem", fontWeight: 800, color: "#1a2e1f",
                      fontFamily: "'Quicksand', sans-serif", lineHeight: 1.3, margin: 0,
                    }}>
                      Request a reschedule
                    </p>
                    <p style={{
                      fontSize: "0.73rem", fontWeight: 600, color: "#6b8f7a",
                      fontFamily: "'Quicksand', sans-serif", marginTop: 3,
                    }}>
                      The operator will choose from your suggested window
                    </p>
                  </div>
                </div>
                <button className="ac-close" onClick={() => setView("confirm")} disabled={submitting}>
                  <XIcon size={13} />
                </button>
              </div>

              <div className="ac-body">
                <button className="ac-back-btn" onClick={() => setView("confirm")} disabled={submitting}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Back
                </button>

                <div>
                  <label className="ac-field-label">Suggested date</label>
                  <input
                    type="date"
                    className="ac-input"
                    value={reschedule.date}
                    onChange={(e) => setReschedule((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>

                <div className="ac-two-col">
                  <div>
                    <label className="ac-field-label">From time</label>
                    <input
                      type="time"
                      className="ac-input"
                      value={reschedule.fromTime}
                      onChange={(e) => setReschedule((p) => ({ ...p, fromTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="ac-field-label">To time</label>
                    <input
                      type="time"
                      className="ac-input"
                      value={reschedule.toTime}
                      onChange={(e) => setReschedule((p) => ({ ...p, toTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="ac-field-label">Note to operator (optional)</label>
                  <textarea
                    className="ac-textarea"
                    placeholder="e.g. Gate is locked before 9am, please call ahead..."
                    value={reschedule.note}
                    onChange={(e) => setReschedule((p) => ({ ...p, note: e.target.value }))}
                  />
                </div>
              </div>

              <div className="ac-footer">
                <button
                  className="ac-btn-primary"
                  onClick={handleRescheduleSend}
                  disabled={submitting || !canSendReschedule}
                >
                  {submitting
                    ? <><div className="ac-spinner" /> Sending…</>
                    : <>
                        Send reschedule request
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      </>
                  }
                </button>
              </div>
            </>
          )}

          {view === "success" && (
            <div style={{
              padding: "36px 24px",
              textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            }}>
              <div className="ac-success-ring" style={{ background: "#1a4d2e" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2.8"
                  strokeLinecap="round" strokeLinejoin="round" style={{ width: 30, height: 30 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{
                fontSize: "1rem", fontWeight: 800, color: "#1a2e1f",
                fontFamily: "'Quicksand', sans-serif", margin: 0,
              }}>
                Pickup confirmed!
              </p>
              <p style={{
                fontSize: "0.78rem", fontWeight: 600, color: "#6b8f7a",
                fontFamily: "'Quicksand', sans-serif", lineHeight: 1.55,
                maxWidth: 290, margin: 0,
              }}>
                <strong style={{ color: "#1a4d2e" }}>{driverName}</strong> will collect your waste on{" "}
                <strong style={{ color: "#1a4d2e" }}>{item.proposedDate || item.dates}</strong>.
                You'll be notified when they're on the way.
              </p>
              <button className="ac-btn-primary" style={{ marginTop: 6 }} onClick={onClose}>
                Done
              </button>
            </div>
          )}

          {view === "reschedule-sent" && (
            <div style={{
              padding: "36px 24px",
              textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            }}>
              <div className="ac-success-ring" style={{ background: "rgba(59,130,246,0.1)" }}>
                <CalIcon color="#3b82f6" size={28} />
              </div>
              <p style={{
                fontSize: "1rem", fontWeight: 800, color: "#1a2e1f",
                fontFamily: "'Quicksand', sans-serif", margin: 0,
              }}>
                Reschedule request sent
              </p>
              <p style={{
                fontSize: "0.78rem", fontWeight: 600, color: "#6b8f7a",
                fontFamily: "'Quicksand', sans-serif", lineHeight: 1.55,
                maxWidth: 290, margin: 0,
              }}>
                The operator will review your suggested window and confirm a new time. You'll be
                notified once they respond.
              </p>
              <button className="ac-btn-secondary" style={{ marginTop: 6 }} onClick={onClose}>
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default function OperatorRequestDetailModal({ item, onClose, onResubmit, onAcceptPickup, onReschedulePickup }) {
  const [showAcceptance, setShowAcceptance] = useState(false);

  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const fn = (e) => { if (e.key === "Escape" && !showAcceptance) onClose?.(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [item, onClose, showAcceptance]);

  useEffect(() => {
    if (!item) return;
    if (item.status === "Scheduled") {
      setShowAcceptance(true);
    }
  }, [item?.status]);

  if (!item) return null;

  const isCompleted        = item.status === "Completed";
  const isDeclined         = item.status === "Declined";
  const isAwaitingApproval = item.status === "Awaiting Approval";
  const isScheduled        = item.status === "Scheduled";

  const showLiveTracking   = item.status === "In Transit" || item.status === "Arriving";

  const imagesArray = Array.isArray(item.images) ? item.images : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&display=swap');

        @keyframes orBackdropIn { from{opacity:0} to{opacity:1} }
        @keyframes orModalIn    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

        .or-backdrop {
          position:fixed; inset:0; z-index:400;
          background:rgba(10,22,13,0.45);
          backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center;
          padding:16px;
          box-sizing:border-box;
          animation:orBackdropIn 0.2s ease both;
        }
        .or-modal {
          background:#fff; border-radius:20px;
          width:100%; max-width:480px;
          max-height:calc(100dvh - 32px);
          box-shadow:0 16px 64px rgba(10,22,13,0.16);
          display:flex; flex-direction:column; overflow:hidden;
          animation:orModalIn 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }
        .or-header {
          padding:16px 20px; border-bottom:1px solid #f0f7f2;
          display:flex; align-items:center; justify-content:space-between; gap:12px;
        }
        .or-scrollable {
          padding:20px; overflow-y:auto; flex:1;
          display:flex; flex-direction:column; gap:20px;
          -webkit-overflow-scrolling:touch;
        }
        .or-title-row { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
        .or-req-id {
          font-size:0.68rem; font-weight:800; color:#8aab97;
          text-transform:uppercase; letter-spacing:0.06em; margin:0 0 4px;
          font-family:'Quicksand',sans-serif;
        }
        .or-headline {
          font-size:1.1rem; font-weight:800; color:#1a2e1f;
          font-family:'Quicksand',sans-serif; margin:0; line-height:1.3;
          word-break:break-word;
        }
        .or-grid { display:grid; grid-template-columns:1fr 1fr; gap:0 24px; }
        @media (max-width:560px) { .or-grid { grid-template-columns:1fr; } }

        .or-images-label {
          font-size:0.68rem; font-weight:700; color:#9ab8a5;
          text-transform:uppercase; letter-spacing:0.06em; margin-bottom:10px;
          font-family:'Quicksand',sans-serif;
        }
        .or-images-scroll {
          display:flex; gap:10px; overflow-x:auto; padding-bottom:6px;
          -webkit-overflow-scrolling:touch; scroll-snap-type:x proximity;
        }
        .or-img-wrap {
          width:84px; height:84px; border-radius:10px; overflow:hidden;
          border:1px solid #e8f2eb; background:#f5faf6; flex-shrink:0;
          scroll-snap-align:start;
        }
        .or-img { width:100%; height:100%; object-fit:cover; display:block; }

        .or-footer {
          padding:14px 20px; border-top:1px solid #f0f7f2;
          display:flex; justify-content:flex-end; gap:10px; background:#fff;
        }
        .or-btn-close {
          padding:10px 18px; border-radius:10px;
          background:#1a4d2e; border:none; cursor:pointer;
          color:#B8D52E; font-size:0.85rem; font-weight:700;
          font-family:'Quicksand',sans-serif; transition:background 0.15s, color 0.15s;
        }
        .or-btn-close:hover { background:#B8D52E; color:#0d2416; }

        @media (max-width:480px) {
          .or-backdrop { padding:0; align-items:flex-end; }
          .or-modal {
            max-width:100%; width:100%;
            border-radius:20px 20px 0 0;
            max-height:90dvh;
          }
          .or-scrollable { padding:16px; gap:16px; }
          .or-header { padding:14px 16px; }
          .or-footer { padding:12px 16px; }
          .or-headline { font-size:1rem; }
        }
      `}</style>

      <div
        className="or-backdrop"
        onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      >
        <div className="or-modal">

          <div className="or-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, flexWrap: "wrap", minWidth: 0 }}>
              <StatusBadge status={item.status} />
              {item.wasteType && <WasteTypeBadge type={item.wasteType} />}
            </div>
            <button className="ac-close" onClick={onClose}>
              <XIcon size={13} />
            </button>
          </div>

          <div className="or-scrollable">
            <div>
              <div className="or-title-row">
                <div style={{ minWidth: 0 }}>
                  <p className="or-req-id">Request ID: #{item.id?.slice(-6).toUpperCase() || "N/A"}</p>
                  <h3 className="or-headline">{item.wasteType || "General"} Waste Collection</h3>
                </div>
              </div>
            </div>

            <StatusBanner status={item.status} />

            <div className="or-grid">
              <DetailRow
                label="Pickup window"
                icon={<CalIcon size={16} />}
                value={`${item.dates || "Not specified"} (${item.availability || "Flexible"})`}
              />
              <DetailRow
                label="Location"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                }
                value={item.location || "No address provided"}
              />
              <DetailRow
                label="Estimated Volume"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                  </svg>
                }
                value={item.volume ? `${item.volume} m³` : "Not provided"}
              />
              <DetailRow
                label="Bin size preference"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  </svg>
                }
                value={item.binSize || "No preference"}
                last
              />
            </div>

            {imagesArray.length > 0 && (
              <div>
                <p className="or-images-label">Attached Site Images ({imagesArray.length})</p>
                <div className="or-images-scroll">
                  {imagesArray.map((url, index) => (
                    <div key={index} className="or-img-wrap">
                      <img src={url} alt={`Site visual ${index + 1}`} className="or-img" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Timeline status={item.status} />

            {showLiveTracking && <LiveTrackingSection item={item} />}
          </div>

          <div className="or-footer">
            <button className="or-btn-close" onClick={onClose}>
              Dismiss View
            </button>
          </div>

        </div>
      </div>

      {showAcceptance && (
        <AcceptanceConfirmModal
          item={item}
          onClose={() => setShowAcceptance(false)}
          onAccept={onAcceptPickup}
          onReschedule={onReschedulePickup}
        />
      )}
    </>
  );
}
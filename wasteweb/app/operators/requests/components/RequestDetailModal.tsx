"use client";

import { useEffect } from "react";

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

const STATUS_STEPS: Record<string, boolean[]> = {
  Pending:      [true,  false, false, false],
  Scheduled:    [true,  true,  false, false],
  Arriving:     [true,  true,  true,  false],
  "In Transit": [true,  true,  true,  false],
  Completed:    [true,  true,  true,  true ],
  Declined:     [true,  false, false, false],
};

const TIMELINE_STEPS = [
  { label: "Request submitted",  sub: "Contractor raised a pickup request"  },
  { label: "Request accepted",   sub: "Operator confirmed the job"          },
  { label: "In transit",         sub: "Contractor collected the waste"      },
  { label: "Pickup completed",   sub: "Job successfully fulfilled"          },
];

const BANNERS: Record<string, {
  iconStroke: string;
  iconPath: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  title: string;
  sub: string;
}> = {
  Pending: {
    iconStroke: "#f59e0b",
    iconPath: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    iconBg: "#fffbeb", iconBorder: "rgba(251,191,36,0.35)",
    title: "Awaiting Response",
    sub: "This request is pending your acceptance",
  },
  Scheduled: {
    iconStroke: "#3b82f6",
    iconPath: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    iconBg: "rgba(59,130,246,0.08)", iconBorder: "rgba(59,130,246,0.25)",
    title: "Pickup Scheduled",
    sub: "You have confirmed and scheduled this job",
  },
  Arriving: {
    iconStroke: "#06b6d4",
    iconPath: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    iconBg: "rgba(34,211,238,0.08)", iconBorder: "rgba(34,211,238,0.25)",
    title: "Contractor Arriving",
    sub: "Contractor is on the way to the pickup location",
  },
  "In Transit": {
    iconStroke: "#a855f7",
    iconPath: <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
    iconBg: "rgba(168,85,247,0.08)", iconBorder: "rgba(168,85,247,0.25)",
    title: "Waste In Transit",
    sub: "Waste has been collected and is being transported",
  },
  Completed: {
    iconStroke: "#B8D52E",
    iconPath: <polyline points="20 6 9 17 4 12"/>,
    iconBg: "#1a4d2e", iconBorder: "transparent",
    title: "Pickup Completed",
    sub: "This job has been successfully fulfilled",
  },
  Declined: {
    iconStroke: "#ef4444",
    iconPath: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    iconBg: "rgba(239,68,68,0.08)", iconBorder: "rgba(239,68,68,0.25)",
    title: "Request Declined",
    sub: "This pickup request was not accepted",
  },
};

type RequestItem = {
  id: string;
  title: string;
  wasteType: string;
  status: string;
  location: string;
  dates: string;
  yards: string;
  note: string;
  contractorName?: string;
  createdAt?: string;
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.Pending;
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

function WasteTypeBadge({ type }: { type: string }) {
  const c = WASTE_TYPE_CONFIG[type as keyof typeof WASTE_TYPE_CONFIG] || WASTE_TYPE_CONFIG.General;
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
      {type}
    </span>
  );
}

function DetailRow({ icon, label, value, valueColor, last }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  last?: boolean;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 4,
      padding: "14px 0",
      borderBottom: last ? "none" : "1px solid #f0f7f2",
    }}>
      <span style={{
        fontSize: "0.7rem", fontWeight: 700, color: "#9ab8a5",
        fontFamily: "'Quicksand', sans-serif",
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#8aab97", flexShrink: 0, display: "flex", alignItems: "center" }}>{icon}</span>
        <span style={{
          fontSize: "0.9rem", fontWeight: 600,
          color: valueColor || "#1a2e1f",
          fontFamily: "'Quicksand', sans-serif",
          lineHeight: 1.45,
        }}>{value}</span>
      </div>
    </div>
  );
}

function StatusBanner({ status }: { status: string }) {
  const b = BANNERS[status] || BANNERS.Pending;
  return (
    <div style={{
      background: "#f5faf6", border: "1px solid #e8f2eb",
      borderRadius: 12, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      marginBottom: 20,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: b.iconBg,
        border: `1px solid ${b.iconBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={b.iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
          {b.iconPath}
        </svg>
      </div>
      <div>
        <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", margin: 0 }}>
          {b.title}
        </p>
        <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#6b8f7a", fontFamily: "'Quicksand', sans-serif", margin: 0 }}>
          {b.sub}
        </p>
      </div>
    </div>
  );
}

export default function RequestDetailModal({
  item,
  onClose,
  onAccept,
  onDecline,
}: {
  item: RequestItem | null;
  onClose: () => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [item, onClose]);

  if (!item) return null;

  const isPending   = item.status === "Pending";
  const isDeclined  = item.status === "Declined";
  const isCompleted = item.status === "Completed";
  const steps       = STATUS_STEPS[item.status] || STATUS_STEPS.Pending;

  return (
    <>
      <style>{`
        @keyframes wfReqBackdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wfReqDrawerIn   { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        .wf-req-modal-backdrop {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(10, 22, 13, 0.45);
          backdrop-filter: blur(3px);
          animation: wfReqBackdropIn 0.22s ease both;
          display: flex; justify-content: flex-end;
        }

        .wf-req-modal-drawer {
          width: 100%; max-width: 460px; height: 100%;
          background: #ffffff;
          display: flex; flex-direction: column;
          animation: wfReqDrawerIn 0.28s cubic-bezier(0.22,1,0.36,1) both;
          box-shadow: -8px 0 40px rgba(0,0,0,0.12);
          overflow: hidden;
        }

        .wf-req-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f0f7f2;
          flex-shrink: 0; background: #ffffff;
        }

        .wf-req-modal-close {
          width: 34px; height: 34px; border-radius: 9px;
          background: #f5faf6; border: 1px solid #e8f2eb;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #4a7a5a;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
          flex-shrink: 0;
        }
        .wf-req-modal-close:hover { background: #fee2e2; border-color: #fca5a5; color: #b91c1c; }

        .wf-req-modal-body {
          flex: 1; overflow-y: auto; padding: 24px;
          display: flex; flex-direction: column;
        }
        .wf-req-modal-body::-webkit-scrollbar { width: 4px; }
        .wf-req-modal-body::-webkit-scrollbar-track { background: transparent; }
        .wf-req-modal-body::-webkit-scrollbar-thumb { background: #c6e2d0; border-radius: 4px; }

        .wf-req-modal-footer {
          flex-shrink: 0; padding: 16px 24px;
          border-top: 1px solid #f0f7f2; background: #ffffff;
          display: flex; flex-direction: column; gap: 8px;
        }

        .wf-req-btn-accept {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 20px; border-radius: 10px;
          background: #1a4d2e; border: none; cursor: pointer;
          color: #B8D52E; font-size: 0.88rem; font-weight: 700;
          font-family: 'Quicksand', sans-serif;
          transition: background 0.18s, transform 0.15s;
        }
        .wf-req-btn-accept:hover { background: #B8D52E; color: #0d2416; transform: translateY(-1px); }

        .wf-req-btn-decline {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 20px; border-radius: 10px;
          background: none; border: 1px solid #fca5a5; cursor: pointer;
          color: #b91c1c; font-size: 0.88rem; font-weight: 700;
          font-family: 'Quicksand', sans-serif;
          transition: background 0.18s, border-color 0.18s;
        }
        .wf-req-btn-decline:hover { background: #fee2e2; border-color: #ef4444; }

        .wf-req-btn-secondary {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 20px; border-radius: 10px;
          background: none; border: 1px solid #e8f2eb; cursor: pointer;
          color: #1a4d2e; font-size: 0.88rem; font-weight: 700;
          font-family: 'Quicksand', sans-serif;
          transition: background 0.18s, border-color 0.18s;
        }
        .wf-req-btn-secondary:hover { background: #f0f7f2; border-color: #B8D52E; }

        @media (max-width: 480px) { .wf-req-modal-drawer { max-width: 100%; } }
      `}</style>

      <div
        className="wf-req-modal-backdrop"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label="Request details"
      >
        <div className="wf-req-modal-drawer">

          <div className="wf-req-modal-header">
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, color: "#9ab8a5",
                fontFamily: "'Quicksand', sans-serif",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                Request Details
              </span>
              <span style={{
                fontSize: "1rem", fontWeight: 700,
                color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif",
              }}>
                {item.title}
              </span>
            </div>
            <button className="wf-req-modal-close" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="wf-req-modal-body">

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 20, flexWrap: "wrap", gap: 8,
            }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <WasteTypeBadge type={item.wasteType} />
                <StatusBadge status={item.status} />
              </div>
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, color: "#9ab8a5",
                fontFamily: "'Quicksand', sans-serif", letterSpacing: "0.04em",
              }}>
                {item.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <StatusBanner status={item.status} />

            <DetailRow
              label="Location"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              }
              value={item.location}
            />

            {item.createdAt && (
              <DetailRow
                label="Submitted"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                }
                value={item.createdAt}
                valueColor="#6b8f7a"
              />
            )}

            <DetailRow
              label="Pickup Period"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              }
              value={item.dates}
            />

            <DetailRow
              label="Waste Type"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              }
              value={item.wasteType}
            />

            <DetailRow
              label="Total Yards"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              }
              value={item.yards}
              valueColor="#1a4d2e"
            />

            {item.contractorName && (
              <DetailRow
                label="Contractor"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                }
                value={item.contractorName}
              />
            )}

            {item.note && (
              <DetailRow
                label="Notes"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                }
                value={item.note}
                valueColor="#6b8f7a"
                last
              />
            )}

            <div style={{ paddingTop: 14 }}>
              <p style={{
                fontSize: "0.7rem", fontWeight: 700, color: "#9ab8a5",
                fontFamily: "'Quicksand', sans-serif",
                textTransform: "uppercase", letterSpacing: "0.06em",
                marginBottom: 12,
              }}>
                Status Timeline
              </p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {TIMELINE_STEPS.map((step, i, arr) => {
                  const done     = steps[i];
                  const isDenied = isDeclined && i > 0;
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
                            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          ) : done ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
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
                      <div style={{ paddingBottom: isLast ? 0 : 16, paddingTop: 2 }}>
                        <p style={{
                          fontSize: "0.82rem", fontWeight: 700,
                          color: isDenied ? "#b91c1c" : done ? "#1a2e1f" : "#9ab8a5",
                          fontFamily: "'Quicksand', sans-serif", margin: 0,
                        }}>
                          {step.label}
                        </p>
                        <p style={{
                          fontSize: "0.74rem", fontWeight: 600,
                          color: isDenied ? "rgba(185,28,28,0.6)" : "#8aab97",
                          fontFamily: "'Quicksand', sans-serif", margin: 0, marginTop: 2,
                        }}>
                          {isDenied ? "Not applicable — request declined" : step.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="wf-req-modal-footer">
            {isPending && (
              <>
                <button
                  className="wf-req-btn-accept"
                  onClick={() => { onAccept(item.id); onClose(); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Accept Request
                </button>
                <button
                  className="wf-req-btn-decline"
                  onClick={() => { onDecline(item.id); onClose(); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Decline Request
                </button>
              </>
            )}

            {isCompleted && (
              <button className="wf-req-btn-accept">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Receipt
              </button>
            )}

            {!isPending && !isCompleted && (
              <button className="wf-req-btn-secondary" onClick={onClose}>
                Close
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
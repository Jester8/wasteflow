"use client";

import { useEffect } from "react";

const WASTE_TYPE_CONFIG = {
  Mixed:    { bg: "rgba(168,85,247,0.10)", color: "#7c3aed", border: "rgba(168,85,247,0.25)" },
  Metal:    { bg: "rgba(100,116,139,0.10)",color: "#475569", border: "rgba(100,116,139,0.25)" },
  Concrete: { bg: "rgba(120,113,108,0.10)",color: "#57534e", border: "rgba(120,113,108,0.25)" },
  Green:    { bg: "rgba(34,197,94,0.10)",  color: "#15803d", border: "rgba(34,197,94,0.25)"  },
  Hazardous:{ bg: "rgba(239,68,68,0.10)",  color: "#b91c1c", border: "rgba(239,68,68,0.25)"  },
  General:  { bg: "rgba(59,130,246,0.10)", color: "#1d4ed8", border: "rgba(59,130,246,0.25)" },
  Wood:     { bg: "rgba(217,119,6,0.10)",  color: "#b45309", border: "rgba(217,119,6,0.25)"  },
};

const STATUS_CONFIG = {
  ARRIVING:   { bg: "rgba(59,130,246,0.10)", color: "#1d4ed8", border: "rgba(59,130,246,0.25)", label: "Arriving" },
  "IN TRANSIT":{ bg: "rgba(168,85,247,0.10)", color: "#7c3aed", border: "rgba(168,85,247,0.25)", label: "In Transit" },
  SCHEDULED:  { bg: "rgba(100,116,139,0.10)", color: "#475569", border: "rgba(100,116,139,0.25)", label: "Scheduled" },
  COLLECTING: { bg: "rgba(34,197,94,0.10)",  color: "#15803d", border: "rgba(34,197,94,0.25)",  label: "Collecting" },
};

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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
      {type}
    </span>
  );
}

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.SCHEDULED;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase",
      padding: "4px 10px", borderRadius: 999,
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      fontFamily: "'Quicksand', sans-serif",
      whiteSpace: "nowrap",
    }}>
      {c.label}
    </span>
  );
}

function DetailRow({ icon, label, value, valueColor }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 4,
      padding: "14px 0",
      borderBottom: "1px solid #f0f7f2",
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

export default function PickupDetailModal({ item, onClose }) {
  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [item, onClose]);

  if (!item) return null;

  const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.SCHEDULED;

  // Different status illustration states
  const getStatusSteps = (status) => {
    const steps = [
      { label: "Request scheduled", sub: "Pickup date confirmed" },
      { label: "Driver assigned", sub: "Contractor assigned to job" },
      { label: "In transit", sub: "Driver en route to location" },
      { label: "Arriving soon", sub: "Driver approaching site" },
      { label: "Pickup completed", sub: "Waste collected successfully" },
    ];

    switch (status) {
      case "ARRIVING":
        return steps.map((step, idx) => ({
          ...step,
          done: idx <= 3,
        }));
      case "IN TRANSIT":
        return steps.map((step, idx) => ({
          ...step,
          done: idx <= 2,
        }));
      case "COLLECTING":
        return steps.map((step, idx) => ({
          ...step,
          done: idx <= 4,
        }));
      case "SCHEDULED":
      default:
        return steps.map((step, idx) => ({
          ...step,
          done: idx <= 0,
        }));
    }
  };

  const statusSteps = getStatusSteps(item.status);

  return (
    <>
      <style>{`
        @keyframes wfBackdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes wfDrawerIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }

        .wf-modal-backdrop {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(10, 22, 13, 0.45);
          backdrop-filter: blur(3px);
          animation: wfBackdropIn 0.22s ease both;
          display: flex; justify-content: flex-end;
        }

        .wf-modal-drawer {
          width: 100%; max-width: 460px;
          height: 100%;
          background: #ffffff;
          display: flex; flex-direction: column;
          animation: wfDrawerIn 0.28s cubic-bezier(0.22,1,0.36,1) both;
          box-shadow: -8px 0 40px rgba(0,0,0,0.12);
          overflow: hidden;
        }

        .wf-modal-header {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f0f7f2;
          flex-shrink: 0;
          background: #ffffff;
        }

        .wf-modal-close {
          width: 34px; height: 34px; border-radius: 9px;
          background: #f5faf6; border: 1px solid #e8f2eb;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #4a7a5a;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
          flex-shrink: 0;
        }
        .wf-modal-close:hover {
          background: #fee2e2; border-color: #fca5a5; color: #b91c1c;
        }

        .wf-modal-body {
          flex: 1; overflow-y: auto; padding: 24px;
          display: flex; flex-direction: column; gap: 0;
        }
        .wf-modal-body::-webkit-scrollbar { width: 4px; }
        .wf-modal-body::-webkit-scrollbar-track { background: transparent; }
        .wf-modal-body::-webkit-scrollbar-thumb { background: #c6e2d0; border-radius: 4px; }

        .wf-modal-footer {
          flex-shrink: 0;
          padding: 16px 24px;
          border-top: 1px solid #f0f7f2;
          background: #ffffff;
          display: flex;
          gap: 12px;
        }

        .wf-modal-primary-btn {
          flex: 1; display: flex; align-items: center;
          justify-content: center; gap: 8px;
          padding: 12px 20px; border-radius: 10px;
          background: #1a4d2e; border: none; cursor: pointer;
          color: #B8D52E; font-size: 0.88rem; font-weight: 700;
          font-family: "'Quicksand', sans-serif";
          transition: background 0.18s, transform 0.15s;
        }
        .wf-modal-primary-btn:hover {
          background: #0f2d1a; transform: translateY(-1px);
        }

        .wf-modal-secondary-btn {
          flex: 1; display: flex; align-items: center;
          justify-content: center; gap: 8px;
          padding: 12px 20px; border-radius: 10px;
          background: #ffffff; border: 1px solid #e8f2eb;
          cursor: pointer; color: #1a4d2e; font-size: 0.88rem; font-weight: 700;
          font-family: "'Quicksand', sans-serif";
          transition: background 0.18s, border-color 0.18s;
        }
        .wf-modal-secondary-btn:hover {
          background: #f5faf6; border-color: #B8D52E;
        }

        @media (max-width: 480px) {
          .wf-modal-drawer { max-width: 100%; }
          .wf-modal-footer { flex-direction: column; }
        }
      `}</style>

      <div
        className="wf-modal-backdrop"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label="Pickup details"
      >
        <div className="wf-modal-drawer">

          <div className="wf-modal-header">
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, color: "#9ab8a5",
                fontFamily: "'Quicksand', sans-serif",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                Pickup Details
              </span>
              <span style={{
                fontSize: "1rem", fontWeight: 700,
                color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif",
              }}>
                {item.title}
              </span>
            </div>
            <button className="wf-modal-close" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="wf-modal-body">

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
                {item.id}
              </span>
            </div>

            {/* Status illustration based on current status */}
            <div style={{
              background: statusConfig.bg,
              border: `1px solid ${statusConfig.border}`,
              borderRadius: 12, padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 20,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: statusConfig.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {item.status === "ARRIVING" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                )}
                {item.status === "IN TRANSIT" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                    <rect x="1" y="3" width="15" height="13" rx="1"/>
                    <path d="M16 8h4l3 5v3h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                )}
                {item.status === "COLLECTING" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                {item.status === "SCHEDULED" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                )}
              </div>
              <div>
                <p style={{ fontSize: "0.78rem", fontWeight: 700, color: statusConfig.color, fontFamily: "'Quicksand', sans-serif", margin: 0 }}>
                  {statusConfig.label}
                </p>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#6b8f7a", fontFamily: "'Quicksand', sans-serif", margin: 0 }}>
                  {item.status === "ARRIVING" && "Driver is almost at your location"}
                  {item.status === "IN TRANSIT" && "Driver is on the way to pickup site"}
                  {item.status === "COLLECTING" && "Waste collection is in progress"}
                  {item.status === "SCHEDULED" && "Pickup has been scheduled"}
                </p>
              </div>
            </div>

            <DetailRow
              label="Location"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              }
              value={item.location}
            />

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
              label="Total Weight"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              }
              value={item.weight}
              valueColor="#1a4d2e"
            />

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
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {statusSteps.map((step, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                        background: step.done ? "#1a4d2e" : "#f0f7f2",
                        border: step.done ? "2px solid #1a4d2e" : "2px solid #c6e2d0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginTop: 2,
                      }}>
                        {step.done && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{
                          width: 2, flex: 1, minHeight: 24,
                          background: step.done ? "#1a4d2e" : "#e8f2eb",
                          margin: "3px 0",
                        }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: i < arr.length - 1 ? 16 : 0, paddingTop: 2 }}>
                      <p style={{ fontSize: "0.82rem", fontWeight: 700, color: step.done ? "#1a2e1f" : "#9ab8a5", fontFamily: "'Quicksand', sans-serif", margin: 0 }}>
                        {step.label}
                      </p>
                      <p style={{ fontSize: "0.74rem", fontWeight: 600, color: "#8aab97", fontFamily: "'Quicksand', sans-serif", margin: 0, marginTop: 2 }}>
                        {step.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="wf-modal-footer">
            <button className="wf-modal-secondary-btn" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Track Live
            </button>
            <button className="wf-modal-primary-btn" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Details
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
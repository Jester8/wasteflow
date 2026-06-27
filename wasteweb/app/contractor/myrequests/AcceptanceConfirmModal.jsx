"use client";

import { useState, useEffect } from "react";

export default function AcceptanceConfirmModal({ item, onClose, onAccept, onReschedule }) {
  const [view, setView] = useState("confirm"); // "confirm" | "reschedule" | "success" | "reschedule-sent"
  const [reschedule, setReschedule] = useState({ date: "", fromTime: "", toTime: "", note: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const fn = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [item]);

  if (!item) return null;

  function handleClose() {
    onClose?.();
    setTimeout(() => {
      setView("confirm");
      setReschedule({ date: "", fromTime: "", toTime: "", note: "" });
    }, 300);
  }

async function handleAccept() {
  setSubmitting(true);
  try {
    await onAccept?.(item);
    setView("success");
  } catch (err) {
    console.error(err);
    alert("Something went wrong confirming the pickup. Please try again.");
  } finally {
    setSubmitting(false);
  }
}
  async function handleRescheduleSend() {
    setSubmitting(true);
    try {
      await onReschedule?.(item, reschedule); // your Firestore update logic here
      setView("reschedule-sent");
    } finally {
      setSubmitting(false);
    }
  }

 const driverName = item?.operatorName || "Your skip driver";
  const driverInitials = driverName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&display=swap');
        @keyframes acBackdropIn { from{opacity:0} to{opacity:1} }
        @keyframes acModalIn { from{opacity:0;transform:scale(0.93) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes acRingPop { 0%{transform:scale(0)} 60%{transform:scale(1.18)} 100%{transform:scale(1)} }

        .ac-backdrop {
          position:fixed; inset:0; z-index:400;
          background:rgba(10,22,13,0.55);
          backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center;
          padding:20px;
          animation:acBackdropIn 0.2s ease both;
        }
        .ac-modal {
          background:#fff; border-radius:18px;
          width:100%; max-width:400px;
          box-shadow:0 12px 48px rgba(0,0,0,0.2);
          overflow:hidden;
          animation:acModalIn 0.28s cubic-bezier(0.22,1,0.36,1) both;
        }
        .ac-header {
          padding:18px 20px 14px;
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
        .ac-body { padding:16px 20px; display:flex; flex-direction:column; gap:12px; }
        .ac-footer { padding:0 20px 18px; display:flex; flex-direction:column; gap:8px; }
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
        .ac-label {
          font-size:0.68rem; font-weight:700; color:#9ab8a5;
          text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px;
          font-family:'Quicksand',sans-serif;
        }
        .ac-input {
          width:100%; padding:9px 11px; border-radius:8px;
          border:1.5px solid #e8f2eb; background:#fff;
          font-size:0.82rem; font-weight:600; color:#1a2e1f;
          font-family:'Quicksand',sans-serif; outline:none; colorScheme:light;
          transition:border 0.15s, box-shadow 0.15s;
          box-sizing:border-box;
        }
        .ac-input:focus { border-color:#B8D52E; box-shadow:0 0 0 3px rgba(184,213,46,0.12); }
        .ac-textarea {
          width:100%; padding:9px 11px; border-radius:8px;
          border:1.5px solid #e8f2eb; background:#fff;
          font-size:0.82rem; font-weight:600; color:#1a2e1f;
          font-family:'Quicksand',sans-serif; outline:none; resize:none; min-height:72px;
          transition:border 0.15s, box-shadow 0.15s; box-sizing:border-box;
        }
        .ac-textarea:focus { border-color:#B8D52E; box-shadow:0 0 0 3px rgba(184,213,46,0.12); }
        .ac-success-ring {
          width:64px; height:64px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          animation:acRingPop 0.4s cubic-bezier(0.22,1,0.36,1) 0.05s both;
        }
      `}</style>

      <div
        className="ac-backdrop"
        onClick={(e) => { if (e.target === e.currentTarget && !submitting) handleClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label="Pickup acceptance"
      >
        <div className="ac-modal">

          {/* ── VIEW: Confirm ── */}
          {view === "confirm" && (
            <>
              <div className="ac-header">
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div className="ac-icon" style={{ background:"#f0fdf4", border:"1px solid rgba(34,197,94,0.25)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:22, height:22 }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize:"0.95rem", fontWeight:800, color:"#1a2e1f", fontFamily:"'Quicksand',sans-serif", lineHeight:1.3 }}>
                      Your request has been accepted by a skip driver
                    </p>
                    <p style={{ fontSize:"0.73rem", fontWeight:600, color:"#6b8f7a", fontFamily:"'Quicksand',sans-serif", marginTop:2 }}>
                      Review and confirm or request a new time
                    </p>
                  </div>
                </div>
                <button className="ac-close" onClick={handleClose}><XIcon /></button>
              </div>
              <div className="ac-body">
                {/* Driver card */}
                <div style={{
                  display:"flex", alignItems:"center", gap:10,
                  background:"rgba(184,213,46,0.08)", border:"1px solid rgba(184,213,46,0.25)",
                  borderRadius:10, padding:"10px 13px",
                }}>
                  <div style={{
                    width:36, height:36, borderRadius:"50%", background:"#1a4d2e",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"0.72rem", fontWeight:800, color:"#B8D52E", flexShrink:0,
                    fontFamily:"'Quicksand',sans-serif",
                  }}>
                    {driverInitials}
                  </div>
                  <div>
                    <p style={{ fontSize:"0.85rem", fontWeight:700, color:"#1a2e1f", fontFamily:"'Quicksand',sans-serif", margin:0 }}>{driverName}</p>
                    <p style={{ fontSize:"0.7rem", fontWeight:600, color:"#6b8f7a", fontFamily:"'Quicksand',sans-serif", margin:0 }}>
                      {item.driverRating ? `${item.driverRating}★ · ` : ""}Skip driver
                    </p>
                  </div>
                </div>
                {/* Proposed details */}
                <div style={{ background:"#f5faf6", border:"1px solid #e8f2eb", borderRadius:10, padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
                  {[
                    { label:"Proposed date",        val: item.proposedDate  || item.dates },
                    { label:"Proposed time window", val: item.proposedTime  || item.availability },
                    { label:"Location",             val: item.location },
                  ].map(({ label, val }) => val && (
                    <div key={label}>
                      <p className="ac-label">{label}</p>
                      <p style={{ fontSize:"0.85rem", fontWeight:700, color:"#1a2e1f", fontFamily:"'Quicksand',sans-serif", margin:0 }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ac-footer">
                <button className="ac-btn-primary" onClick={handleAccept} disabled={submitting}>
                  {submitting ? "Confirming…" : <>
                    <CheckIcon /> Accept pickup
                  </>}
                </button>
                <button className="ac-btn-secondary" onClick={() => setView("reschedule")}>
                  <CalIcon /> Request reschedule
                </button>
              </div>
            </>
          )}

          {/* ── VIEW: Reschedule form ── */}
          {view === "reschedule" && (
            <>
              <div className="ac-header">
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div className="ac-icon" style={{ background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.25)" }}>
                    <CalIcon color="#3b82f6" size={22} />
                  </div>
                  <div>
                    <p style={{ fontSize:"0.95rem", fontWeight:800, color:"#1a2e1f", fontFamily:"'Quicksand',sans-serif", lineHeight:1.3 }}>Request a reschedule</p>
                    <p style={{ fontSize:"0.73rem", fontWeight:600, color:"#6b8f7a", fontFamily:"'Quicksand',sans-serif", marginTop:2 }}>The driver will pick a time from your window</p>
                  </div>
                </div>
                <button className="ac-close" onClick={() => setView("confirm")}><XIcon /></button>
              </div>
              <div className="ac-body">
                <button
                  onClick={() => setView("confirm")}
                  style={{ background:"none", border:"none", cursor:"pointer", fontSize:"0.78rem", fontWeight:700, color:"#6b8f7a", fontFamily:"'Quicksand',sans-serif", display:"flex", alignItems:"center", gap:4, padding:0 }}
                >
                  ← Back
                </button>
                <div>
                  <p className="ac-label">Suggested date</p>
                  <input type="date" className="ac-input" value={reschedule.date}
                    onChange={e => setReschedule(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <p className="ac-label">From time</p>
                    <input type="time" className="ac-input" value={reschedule.fromTime}
                      onChange={e => setReschedule(p => ({ ...p, fromTime: e.target.value }))} />
                  </div>
                  <div>
                    <p className="ac-label">To time</p>
                    <input type="time" className="ac-input" value={reschedule.toTime}
                      onChange={e => setReschedule(p => ({ ...p, toTime: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <p className="ac-label">Note to driver (optional)</p>
                  <textarea className="ac-textarea"
                    placeholder="e.g. Gate is locked before 9am, please call ahead..."
                    value={reschedule.note}
                    onChange={e => setReschedule(p => ({ ...p, note: e.target.value }))}
                  />
                </div>
              </div>
              <div className="ac-footer">
                <button className="ac-btn-primary" onClick={handleRescheduleSend} disabled={submitting || !reschedule.date || !reschedule.fromTime || !reschedule.toTime}>
                  {submitting ? "Sending…" : "Send reschedule request →"}
                </button>
              </div>
            </>
          )}

          {/* ── VIEW: Accepted ── */}
          {view === "success" && (
            <div style={{ padding:"32px 24px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
              <div className="ac-success-ring" style={{ background:"#1a4d2e" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:30, height:30 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ fontSize:"1rem", fontWeight:800, color:"#1a2e1f", fontFamily:"'Quicksand',sans-serif" }}>Pickup confirmed!</p>
              <p style={{ fontSize:"0.78rem", fontWeight:600, color:"#6b8f7a", fontFamily:"'Quicksand',sans-serif", lineHeight:1.55, maxWidth:280 }}>
                {driverName} will collect your waste on <strong style={{ color:"#1a4d2e" }}>{item.proposedDate || item.dates}</strong>. You'll be notified when they're on the way.
              </p>
              <button className="ac-btn-primary" style={{ marginTop:4 }} onClick={handleClose}>Done</button>
            </div>
          )}

          {/* ── VIEW: Reschedule sent ── */}
          {view === "reschedule-sent" && (
            <div style={{ padding:"32px 24px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
              <div className="ac-success-ring" style={{ background:"rgba(59,130,246,0.1)" }}>
                <CalIcon color="#3b82f6" size={28} />
              </div>
              <p style={{ fontSize:"1rem", fontWeight:800, color:"#1a2e1f", fontFamily:"'Quicksand',sans-serif" }}>Reschedule request sent</p>
              <p style={{ fontSize:"0.78rem", fontWeight:600, color:"#6b8f7a", fontFamily:"'Quicksand',sans-serif", lineHeight:1.55, maxWidth:280 }}>
                The driver will review your suggested window and confirm a new time. You'll be notified once they respond.
              </p>
              <button className="ac-btn-secondary" style={{ marginTop:4 }} onClick={handleClose}>Close</button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

// Tiny icon helpers
function XIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width:13, height:13 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function CheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:14, height:14 }}><polyline points="20 6 9 17 4 12"/></svg>;
}
function CalIcon({ color = "currentColor", size = 22 }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:size, height:size }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
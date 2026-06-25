"use client";

import { useState, useEffect, useRef } from "react";

const WASTE_TYPES = ["Mixed", "Metal", "Concrete", "Green", "Hazardous", "General"];

const WASTE_TYPE_CONFIG = {
  Mixed:     { bg: "rgba(168,85,247,0.10)",  color: "#7c3aed", border: "rgba(168,85,247,0.25)" },
  Metal:     { bg: "rgba(100,116,139,0.10)", color: "#475569", border: "rgba(100,116,139,0.25)" },
  Concrete:  { bg: "rgba(120,113,108,0.10)", color: "#57534e", border: "rgba(120,113,108,0.25)" },
  Green:     { bg: "rgba(34,197,94,0.10)",   color: "#15803d", border: "rgba(34,197,94,0.25)"  },
  Hazardous: { bg: "rgba(239,68,68,0.10)",   color: "#b91c1c", border: "rgba(239,68,68,0.25)"  },
  General:   { bg: "rgba(59,130,246,0.10)",  color: "#1d4ed8", border: "rgba(59,130,246,0.25)" },
};

function WasteTypePill({ type, selected, onClick }) {
  const c = WASTE_TYPE_CONFIG[type] || WASTE_TYPE_CONFIG.General;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "6px 12px", borderRadius: 999, cursor: "pointer",
        fontFamily: "'Quicksand', sans-serif",
        fontSize: "0.75rem", fontWeight: 700,
        background: selected ? c.bg : "#f5faf6",
        color: selected ? c.color : "#8aab97",
        border: selected ? `1.5px solid ${c.border}` : "1.5px solid #e8f2eb",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {type}
    </button>
  );
}

function Label({ children, required }) {
  return (
    <label style={{
      display: "block",
      fontSize: "0.7rem", fontWeight: 700,
      color: "#9ab8a5", letterSpacing: "0.06em",
      textTransform: "uppercase",
      fontFamily: "'Quicksand', sans-serif",
      marginBottom: 7,
    }}>
      {children}
      {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
    </label>
  );
}

function FieldHint({ children }) {
  return (
    <p style={{
      fontSize: "0.7rem", fontWeight: 600, color: "#9ab8a5",
      fontFamily: "'Quicksand', sans-serif", marginTop: 5,
    }}>
      {children}
    </p>
  );
}

function inputStyle(focused, error) {
  return {
    width: "100%",
    padding: "10px 13px",
    borderRadius: 10,
    border: error
      ? "1.5px solid #fca5a5"
      : focused
        ? "1.5px solid #B8D52E"
        : "1.5px solid #e8f2eb",
    background: "#ffffff",
    fontSize: "0.875rem", fontWeight: 600,
    color: "#1a2e1f",
    fontFamily: "'Quicksand', sans-serif",
    outline: "none",
    transition: "border 0.18s, box-shadow 0.18s",
    boxShadow: focused && !error ? "0 0 0 3px rgba(184,213,46,0.12)" : "none",
    boxSizing: "border-box",
  };
}

function FocusInput({ as: Tag = "input", error, style, extraStyle, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <Tag
      {...props}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e)  => { setFocused(false); props.onBlur?.(e);  }}
      style={{ ...inputStyle(focused, error), ...style, ...extraStyle }}
    />
  );
}

const STEPS = ["Job Details", "Schedule", "Notes"];

function StepBar({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        const last   = i === STEPS.length - 1;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: last ? "none" : 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: done ? "#1a4d2e" : active ? "#B8D52E" : "#f0f7f2",
                border: done ? "2px solid #1a4d2e" : active ? "2px solid #B8D52E" : "2px solid #e8f2eb",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}>
                {done ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 800,
                    color: active ? "#0d2416" : "#9ab8a5",
                    fontFamily: "'Quicksand', sans-serif",
                  }}>{i + 1}</span>
                )}
              </div>
              <span style={{
                fontSize: "0.62rem", fontWeight: 700,
                color: active ? "#1a2e1f" : done ? "#4a7a5a" : "#9ab8a5",
                fontFamily: "'Quicksand', sans-serif",
                whiteSpace: "nowrap",
                letterSpacing: "0.03em",
              }}>{label}</span>
            </div>
            {!last && (
              <div style={{
                flex: 1, height: 2, marginBottom: 18,
                background: done ? "#1a4d2e" : "#e8f2eb",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const EMPTY_FORM = {
  title: "",
  wasteType: "",
  location: "",
  dateFrom: "",
  dateTo: "",
  volume: "",
  volumeUnit: "Yards",
  availableFromTime: "",
  availableToTime: "",
  note: "",
};

export default function CreateRequestModal({ open, onClose, onSubmit }) {
  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const bodyRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const set = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target ? e.target.value : e }));

  function handleClose() {
    onClose?.();
    setTimeout(() => {
      setStep(0);
      setForm(EMPTY_FORM);
      setErrors({});
      setSubmitted(false);
    }, 300);
  }

  function validateStep(s) {
    const e = {};
    if (s === 0) {
      if (!form.title.trim())    e.title     = "Job title is required";
      if (!form.wasteType)       e.wasteType = "Please select a waste type";
      if (!form.location.trim()) e.location  = "Location is required";
      if (!form.volume?.trim())  e.volume    = "Estimated volume is required";
    }
    if (s === 1) {
      if (!form.dateFrom)          e.dateFrom          = "Start date is required";
      if (!form.dateTo)            e.dateTo            = "End date is required";
      if (!form.availableFromTime) e.availableFromTime = "Start time is required";
      if (!form.availableToTime)   e.availableToTime   = "End time is required";
      if (form.dateFrom && form.dateTo && form.dateTo < form.dateFrom)
        e.dateTo = "End date must be after start date";
    }
    return e;
  }

  function next() {
    const e = validateStep(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep((s) => s + 1);
  }

  function back() {
    setErrors({});
    setStep((s) => s - 1);
  }

  async function submit() {
    setSubmitting(true);
    try {
      const id = `WF-${String(Math.floor(1000 + Math.random() * 9000))}`;

      // Clean up the volume unit if it already contains the string
      let cleanedVolumeUnit = form.volumeUnit || "Yards";
      if (form.volume.toLowerCase().includes(cleanedVolumeUnit.toLowerCase())) {
        cleanedVolumeUnit = "";
      }

      const payload = {
        ...form,
        id,
        status: "Pending",
        submittedAt: new Date(),
        dates: `${fmt(form.dateFrom)} – ${fmt(form.dateTo)}`,
        availability: `${form.availableFromTime} - ${form.availableToTime}`,
        volume: `${form.volume.trim()} ${cleanedVolumeUnit}`.trim(),
      };

      onSubmit?.(payload);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  function fmt(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  if (!open) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&display=swap');

        @keyframes crBackdropIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes crDrawerIn    { from { transform:translateX(100%); opacity:0 } to { transform:translateX(0); opacity:1 } }
        @keyframes crSuccessIn   { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }
        @keyframes crRingPop     { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes crCheckDraw   { from{stroke-dashoffset:30} to{stroke-dashoffset:0} }
        @keyframes crSpin        { to { transform: rotate(360deg); } }

        .cr-backdrop {
          position:fixed; inset:0; z-index:300;
          background:rgba(10,22,13,0.45);
          backdrop-filter:blur(3px);
          animation:crBackdropIn 0.22s ease both;
          display:flex; justify-content:flex-end;
        }
        .cr-drawer {
          width:100%; max-width:480px; height:100%;
          background:#ffffff;
          display:flex; flex-direction:column;
          animation:crDrawerIn 0.28s cubic-bezier(0.22,1,0.36,1) both;
          box-shadow:-8px 0 40px rgba(0,0,0,0.12);
          overflow:hidden;
        }
        .cr-header {
          display:flex; align-items:center; justify-content:space-between;
          padding:20px 24px;
          border-bottom:1px solid #f0f7f2;
          flex-shrink:0; background:#ffffff;
        }
        .cr-close {
          width:34px; height:34px; border-radius:9px;
          background:#f5faf6; border:1px solid #e8f2eb;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:#4a7a5a;
          transition:background 0.18s, border-color 0.18s, color 0.18s;
          flex-shrink:0;
        }
        .cr-close:hover { background:#fee2e2; border-color:#fca5a5; color:#b91c1c; }
        .cr-body {
          flex:1; overflow-y:auto; padding:24px;
          display:flex; flex-direction:column; gap:20px;
        }
        .cr-body::-webkit-scrollbar { width:4px; }
        .cr-body::-webkit-scrollbar-track { background:transparent; }
        .cr-body::-webkit-scrollbar-thumb { background:#c6e2d0; border-radius:4px; }
        .cr-footer {
          flex-shrink:0; padding:16px 24px;
          border-top:1px solid #f0f7f2;
          background:#ffffff;
          display:flex; flex-direction:column; gap:8px;
        }
        .cr-btn-primary {
          width:100%; display:flex; align-items:center; justify-content:center; gap:8px;
          padding:12px 20px; border-radius:10px;
          background:#1a4d2e; border:none; cursor:pointer;
          color:#B8D52E; font-size:0.88rem; font-weight:700;
          font-family:'Quicksand',sans-serif;
          transition:background 0.18s, color 0.18s, transform 0.15s;
        }
        .cr-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .cr-btn-primary:hover:not(:disabled) { background:#B8D52E; color:#0d2416; transform:translateY(-1px); }
        .cr-btn-secondary {
          width:100%; display:flex; align-items:center; justify-content:center; gap:8px;
          padding:12px 20px; border-radius:10px;
          background:none; border:1px solid #e8f2eb; cursor:pointer;
          color:#1a4d2e; font-size:0.88rem; font-weight:700;
          font-family:'Quicksand',sans-serif;
          transition:background 0.18s, border-color 0.18s;
        }
        .cr-btn-secondary:hover { background:#f0f7f2; border-color:#B8D52E; }
        .cr-field { display:flex; flex-direction:column; }
        .cr-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .cr-error {
          font-size:0.7rem; font-weight:600; color:#b91c1c;
          font-family:'Quicksand',sans-serif; margin-top:5px;
        }
        .cr-weight-wrap { display:flex; gap:8px; }
        .cr-weight-wrap input { flex:1; }
        .cr-unit-select {
          padding:10px 10px; border-radius:10px;
          border:1.5px solid #e8f2eb; background:#ffffff;
          color:#1a2e1f; font-size:0.875rem; font-weight:600;
          font-family:'Quicksand',sans-serif; cursor:pointer;
          outline:none; transition:border 0.18s;
          flex-shrink:0;
        }
        .cr-unit-select:focus { border-color:#B8D52E; box-shadow:0 0 0 3px rgba(184,213,46,0.12); }
        .cr-success-wrap {
          flex:1; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          gap:16px; padding:40px 32px; text-align:center;
          animation:crSuccessIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }
        .cr-success-ring {
          width:72px; height:72px; border-radius:50%;
          background:#1a4d2e;
          display:flex; align-items:center; justify-content:center;
          animation:crRingPop 0.4s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }
        .cr-success-check {
          stroke-dasharray:30;
          stroke-dashoffset:30;
          animation:crCheckDraw 0.4s ease 0.4s forwards;
        }
        .cr-waste-pills { display:flex; flex-wrap:wrap; gap:8px; }
        .cr-spinner {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2px solid rgba(184,213,46,0.35);
          border-top-color: #B8D52E;
          animation: crSpin 0.7s linear infinite;
        }
        @media (max-width:480px) {
          .cr-drawer { max-width:100%; }
          .cr-row { grid-template-columns:1fr; }
        }
      `}</style>

      <div
        className="cr-backdrop"
        onClick={(e) => { if (e.target === e.currentTarget && !submitting) handleClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label="Create pickup request"
      >
        <div className="cr-drawer">

          <div className="cr-header">
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, color: "#9ab8a5",
                fontFamily: "'Quicksand', sans-serif",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                {submitted ? "Request Submitted" : "New Pickup Request"}
              </span>
              <span style={{
                fontSize: "1rem", fontWeight: 700,
                color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif",
              }}>
                {submitted ? "You're all set!" : STEPS[step]}
              </span>
            </div>
            <button className="cr-close" onClick={handleClose} aria-label="Close" disabled={submitting}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {submitted ? (
            <div className="cr-success-wrap">
              <div className="cr-success-ring">
                <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
                  <polyline className="cr-success-check" points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", marginBottom: 6 }}>
                  Request submitted!
                </p>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#6b8f7a", fontFamily: "'Quicksand', sans-serif", lineHeight: 1.55 }}>
                  Your pickup request for <strong style={{ color: "#1a4d2e" }}>{form.title || "your job"}</strong> has been submitted and is pending operator review.
                </p>
              </div>
              <div style={{
                width: "100%", background: "#f5faf6",
                border: "1px solid #e8f2eb", borderRadius: 14,
                padding: "16px 18px", textAlign: "left",
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                {[
                  { icon: "📍", label: form.location },
                  { icon: "📅", label: `${fmt(form.dateFrom)} – ${fmt(form.dateTo)}` },
                  { icon: "🕒", label: `${form.availableFromTime} - ${form.availableToTime}` },
                  { icon: "🚛", label: `${form.volume} ${form.volumeUnit}` },
                ].map(({ icon, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "0.85rem" }}>{icon}</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#3a5a45", fontFamily: "'Quicksand', sans-serif" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#9ab8a5", fontFamily: "'Quicksand', sans-serif" }}>
                You'll be notified when an operator accepts your request.
              </p>
            </div>
          ) : (
            <div className="cr-body" ref={bodyRef}>
              <StepBar current={step} />

              {step === 0 && (
                <>
                  <div className="cr-field">
                    <Label required>Job Title</Label>
                    <FocusInput
                      type="text"
                      placeholder="e.g. Site clearance — Phase 2"
                      value={form.title}
                      onChange={set("title")}
                      error={!!errors.title}
                      maxLength={80}
                    />
                    {errors.title && <span className="cr-error">{errors.title}</span>}
                  </div>

                  <div className="cr-field">
                    <Label required>Waste Type</Label>
                    <div className="cr-waste-pills">
                      {WASTE_TYPES.map((t) => (
                        <WasteTypePill
                          key={t}
                          type={t}
                          selected={form.wasteType === t}
                          onClick={() => {
                            setForm((p) => ({ ...p, wasteType: t }));
                            setErrors((e) => ({ ...e, wasteType: null }));
                          }}
                        />
                      ))}
                    </div>
                    {errors.wasteType && <span className="cr-error">{errors.wasteType}</span>}
                  </div>

                  <div className="cr-field">
                    <Label required>Pickup Location</Label>
                    <FocusInput
                      type="text"
                      placeholder="e.g. Canary Wharf, E14"
                      value={form.location}
                      onChange={set("location")}
                      error={!!errors.location}
                    />
                    {errors.location && <span className="cr-error">{errors.location}</span>}
                    <FieldHint>Full address or postcode helps operators find you.</FieldHint>
                  </div>

                  <div className="cr-field">
                    <Label required>Estimated Volume</Label>
                    <div className="cr-weight-wrap">
                      <FocusInput
                        type="number"
                        min="0"
                        placeholder="e.g. 12"
                        value={form.volume}
                        onChange={set("volume")}
                        error={!!errors.volume}
                      />
                      <select
                        className="cr-unit-select"
                        value={form.volumeUnit}
                        onChange={set("volumeUnit")}
                      >
                        <option>Yards</option>
                        <option>Tonnes</option>
                        <option>Tons</option>
                        <option>kg</option>
                      </select>
                    </div>
                    {errors.volume && <span className="cr-error">{errors.volume}</span>}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div style={{
                    background: "rgba(184,213,46,0.07)",
                    border: "1px solid rgba(184,213,46,0.25)",
                    borderRadius: 12, padding: "12px 15px",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#4a7a5a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#3a5a45", fontFamily: "'Quicksand', sans-serif", lineHeight: 1.5, margin: 0 }}>
                      Set the window during which you'd like the pickup to happen. Operators will use this to schedule their visit.
                    </p>
                  </div>

                  <div className="cr-row">
                    <div className="cr-field">
                      <Label required>From Date</Label>
                      <FocusInput
                        type="date"
                        value={form.dateFrom}
                        onChange={set("dateFrom")}
                        error={!!errors.dateFrom}
                        extraStyle={{ colorScheme: "light" }}
                      />
                      {errors.dateFrom && <span className="cr-error">{errors.dateFrom}</span>}
                    </div>

                    <div className="cr-field">
                      <Label required>To Date</Label>
                      <FocusInput
                        type="date"
                        value={form.dateTo}
                        onChange={set("dateTo")}
                        error={!!errors.dateTo}
                        extraStyle={{ colorScheme: "light" }}
                      />
                      {errors.dateTo && <span className="cr-error">{errors.dateTo}</span>}
                    </div>
                  </div>

                  <div className="cr-row">
                    <div className="cr-field">
                      <Label required>Start Time</Label>
                      <FocusInput
                        type="time"
                        value={form.availableFromTime}
                        onChange={set("availableFromTime")}
                        error={!!errors.availableFromTime}
                        extraStyle={{ colorScheme: "light" }}
                      />
                      {errors.availableFromTime && <span className="cr-error">{errors.availableFromTime}</span>}
                    </div>

                    <div className="cr-field">
                      <Label required>End Time</Label>
                      <FocusInput
                        type="time"
                        value={form.availableToTime}
                        onChange={set("availableToTime")}
                        error={!!errors.availableToTime}
                        extraStyle={{ colorScheme: "light" }}
                      />
                      {errors.availableToTime && <span className="cr-error">{errors.availableToTime}</span>}
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="cr-field">
                  <Label>Additional Notes</Label>
                  <FocusInput
                    as="textarea"
                    rows={3}
                    placeholder="Any gate codes, site hazards, specific placement instructions..."
                    value={form.note}
                    onChange={set("note")}
                    style={{ resize: "none" }}
                  />
                </div>
              )}

            </div>
          )}

          {!submitted && (
            <div className="cr-footer">
              {step < 2 ? (
                <button type="button" className="cr-btn-primary" onClick={next}>
                  Continue
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              ) : (
                <button type="button" className="cr-btn-primary" onClick={submit} disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="cr-spinner" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Pickup Request
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </>
                  )}
                </button>
              )}

              {step > 0 && (
                <button type="button" className="cr-btn-secondary" onClick={back} disabled={submitting}>
                  Back
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
"use client";

import { useState } from "react";
import Sidebar from "../sidebar";

const WASTE_TYPES = ["Mixed", "Metal", "Concrete", "Green", "Hazardous", "General"];

const WASTE_TYPE_CONFIG = {
  Mixed:     { bg: "rgba(168,85,247,0.10)",  color: "#7c3aed", border: "rgba(168,85,247,0.25)" },
  Metal:     { bg: "rgba(100,116,139,0.10)", color: "#475569", border: "rgba(100,116,139,0.25)" },
  Concrete:  { bg: "rgba(120,113,108,0.10)", color: "#57534e", border: "rgba(120,113,108,0.25)" },
  Green:     { bg: "rgba(34,197,94,0.10)",   color: "#15803d", border: "rgba(34,197,94,0.25)" },
  Hazardous: { bg: "rgba(239,68,68,0.10)",   color: "#b91c1c", border: "rgba(239,68,68,0.25)" },
  General:   { bg: "rgba(59,130,246,0.10)",  color: "#1d4ed8", border: "rgba(59,130,246,0.25)" },
};

const ICONS = {
  title: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  wasteType: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  quantity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  location: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  note: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
};

function Label({ icon, text, required }: { icon: React.ReactNode; text: string; required?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
      <span style={{ color: "#4a7a5a", display: "flex" }}>{icon}</span>
      <span style={{
        fontSize: "0.82rem", fontWeight: 700, color: "#1a2e1f",
        fontFamily: "'Quicksand', sans-serif", letterSpacing: "0.01em",
      }}>
        {text}
        {required && <span style={{ color: "#B8D52E", marginLeft: 3 }}>*</span>}
      </span>
    </div>
  );
}

function FieldWrap({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>;
}

export default function CreateRequestPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    wasteType: "",
    quantity: "",
    location: "",
    windowStart: "",
    windowEnd: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const isValid =
    form.title.trim() &&
    form.wasteType &&
    form.quantity.trim() &&
    form.location.trim() &&
    form.windowStart &&
    form.windowEnd;

  const handleSubmit = () => {
    if (!isValid) return;
    setSubmitted(true);
  };

  const inputStyle = (field: string) => ({
    width: "100%",
    padding: "11px 14px",
    border: `1px solid ${focused === field ? "#B8D52E" : "#e8f2eb"}`,
    borderRadius: 12,
    background: "#ffffff",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#1a2e1f",
    fontFamily: "'Quicksand', sans-serif",
    outline: "none",
    boxShadow: focused === field ? "0 0 0 3px rgba(184,213,46,0.12)" : "none",
    transition: "border 0.18s, box-shadow 0.18s",
  } as React.CSSProperties);

  if (submitted) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .wf-admin-root { display: flex; min-height: 100vh; background: #f5faf6; font-family: 'Quicksand', sans-serif; }
        .wf-admin-main { flex: 1; min-width: 0; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; }
        .wf-topbar { position: sticky; top: 0; z-index: 10; background: rgba(245,250,246,0.92); backdrop-filter: blur(10px); border-bottom: 1px solid #e8f2eb; padding: 0 28px; height: 60px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .wf-topbar-left { display: flex; align-items: center; gap: 14px; }
        .wf-hamburger { display: none; background: none; border: none; cursor: pointer; color: #1a4d2e; padding: 6px; border-radius: 8px; align-items: center; justify-content: center; transition: background 0.18s; flex-shrink: 0; }
        .wf-hamburger:hover { background: rgba(184,213,46,0.12); }
        @media (max-width: 768px) { .wf-hamburger { display: flex; } }
        `}</style>
        <div className="wf-admin-root">
          <Sidebar
            adminEmail="operator@wasteflow.org"
            adminName="Operator"
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
                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </button>
                <span style={{ fontSize: "1rem", fontWeight: 700, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif" }}>Create Request</span>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div style={{
                background: "#fff", border: "1px solid #e8f2eb",
                borderRadius: 20, padding: "48px 36px",
                maxWidth: 420, width: "100%", textAlign: "center",
                boxShadow: "0 4px 24px rgba(26,77,46,0.08)",
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: "rgba(184,213,46,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1a4d2e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a2e1f", marginBottom: 8, fontFamily: "'Quicksand', sans-serif" }}>
                  Request Submitted
                </h2>
                <p style={{ fontSize: "0.85rem", color: "#6b8f7a", fontWeight: 600, marginBottom: 28, lineHeight: 1.6, fontFamily: "'Quicksand', sans-serif" }}>
                  Your pickup request has been sent. You'll be notified once it's reviewed.
                </p>
                {form.wasteType && (() => {
                  const c = WASTE_TYPE_CONFIG[form.wasteType as keyof typeof WASTE_TYPE_CONFIG];
                  return (
                    <div style={{
                      background: "#f5faf6", border: "1px solid #e8f2eb",
                      borderRadius: 12, padding: "14px 18px", marginBottom: 24,
                      textAlign: "left", display: "flex", flexDirection: "column", gap: 8,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif" }}>{form.title}</span>
                        <span style={{
                          fontSize: "0.65rem", fontWeight: 700,
                          padding: "2px 8px", borderRadius: 999,
                          background: c.bg, color: c.color, border: `1px solid ${c.border}`,
                          fontFamily: "'Quicksand', sans-serif",
                        }}>{form.wasteType}</span>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#6b8f7a", fontWeight: 600, fontFamily: "'Quicksand', sans-serif" }}>{form.location}</span>
                    </div>
                  );
                })()}
                <button
                  onClick={() => { setSubmitted(false); setForm({ title: "", wasteType: "", quantity: "", location: "", windowStart: "", windowEnd: "", notes: "" }); }}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 12, border: "none",
                    background: "#1a4d2e", color: "#B8D52E",
                    fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
                    fontFamily: "'Quicksand', sans-serif",
                  }}
                >
                  Create Another Request
                </button>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wf-admin-root { display: flex; min-height: 100vh; background: #f5faf6; font-family: 'Quicksand', sans-serif; }
        .wf-admin-main { flex: 1; min-width: 0; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; }
        .wf-topbar { position: sticky; top: 0; z-index: 10; background: rgba(245,250,246,0.92); backdrop-filter: blur(10px); border-bottom: 1px solid #e8f2eb; padding: 0 28px; height: 60px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .wf-topbar-left { display: flex; align-items: center; gap: 14px; }
        .wf-topbar-title { font-size: 1rem; font-weight: 700; color: #1a2e1f; font-family: 'Quicksand', sans-serif; }
        .wf-hamburger { display: none; background: none; border: none; cursor: pointer; color: #1a4d2e; padding: 6px; border-radius: 8px; align-items: center; justify-content: center; transition: background 0.18s; flex-shrink: 0; }
        .wf-hamburger:hover { background: rgba(184,213,46,0.12); }

        .cr-page {
          padding: 32px 28px 48px;
          display: flex; flex-direction: column; align-items: center;
          flex: 1;
        }

        .cr-container {
          width: 100%; max-width: 640px;
          display: flex; flex-direction: column; gap: 24px;
        }

        .cr-header { display: flex; flex-direction: column; gap: 4px; }

        .cr-card {
          background: #ffffff;
          border: 1px solid #e8f2eb;
          border-radius: 20px;
          padding: 28px;
          display: flex; flex-direction: column; gap: 20px;
          box-shadow: 0 1px 8px rgba(0,0,0,0.04);
        }

        .cr-section-label {
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #8aab97; margin-bottom: 4px;
          font-family: 'Quicksand', sans-serif;
        }

        .cr-divider {
          height: 1px; background: #f0f7f2; margin: 0 -28px;
        }

        .cr-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .cr-waste-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .cr-waste-btn {
          padding: 10px 8px;
          border-radius: 10px;
          border: 1.5px solid #e8f2eb;
          background: #ffffff;
          font-size: 0.78rem; font-weight: 700;
          font-family: 'Quicksand', sans-serif;
          color: #6b8f7a; cursor: pointer;
          transition: all 0.15s;
          text-align: center;
        }
        .cr-waste-btn:hover { border-color: #B8D52E; color: #1a4d2e; }

        .cr-textarea {
          width: 100%; padding: 11px 14px;
          border: 1px solid #e8f2eb; border-radius: 12px;
          background: #ffffff; font-size: 0.875rem;
          font-weight: 600; color: #1a2e1f;
          font-family: 'Quicksand', sans-serif;
          outline: none; resize: vertical; min-height: 100px;
          transition: border 0.18s, box-shadow 0.18s;
          line-height: 1.5;
        }
        .cr-textarea:focus {
          border-color: #B8D52E;
          box-shadow: 0 0 0 3px rgba(184,213,46,0.12);
        }
        .cr-textarea::placeholder { color: #9ab8a5; }

        .cr-actions {
          display: flex; gap: 12px;
        }

        .cr-btn-cancel {
          flex: 1; padding: 13px;
          border-radius: 12px; border: 1px solid #e8f2eb;
          background: #ffffff; color: #3a5a45;
          font-size: 0.9rem; font-weight: 700;
          font-family: 'Quicksand', sans-serif;
          cursor: pointer; transition: all 0.18s;
        }
        .cr-btn-cancel:hover { border-color: #B8D52E; background: #f5faf6; }

        .cr-btn-submit {
          flex: 2; padding: 13px;
          border-radius: 12px; border: none;
          font-size: 0.9rem; font-weight: 700;
          font-family: 'Quicksand', sans-serif;
          cursor: pointer; transition: all 0.18s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .cr-btn-submit.active {
          background: #1a4d2e; color: #B8D52E;
        }
        .cr-btn-submit.active:hover { background: #0d2416; }
        .cr-btn-submit.disabled {
          background: #e8f2eb; color: #9ab8a5; cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .wf-hamburger { display: flex; }
          .wf-topbar { padding: 0 16px; }
          .cr-page { padding: 16px 16px 48px; }
        }

        @media (max-width: 520px) {
          .cr-grid-2 { grid-template-columns: 1fr; }
          .cr-waste-grid { grid-template-columns: repeat(2, 1fr); }
          .cr-card { padding: 20px; }
          .cr-divider { margin: 0 -20px; }
          .cr-actions { flex-direction: column; }
          .cr-btn-submit, .cr-btn-cancel { flex: unset; width: 100%; }
          .cr-btn-submit { order: -1; }
        }
      `}</style>

      <div className="wf-admin-root">
        <Sidebar
          adminEmail="operator@wasteflow.org"
          adminName="Operator"
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
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <span className="wf-topbar-title">Create Request</span>
            </div>
          </div>
          <div className="cr-page">
        <div className="cr-container">

          {/* Header */}
          <div className="cr-header">
            <h1 style={{
              fontSize: "clamp(1.4rem, 4vw, 1.75rem)",
              fontWeight: 700, color: "#1a2e1f",
              letterSpacing: "-0.02em",
              fontFamily: "'Quicksand', sans-serif",
            }}>
              New Pickup Request
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#6b8f7a", fontWeight: 600, fontFamily: "'Quicksand', sans-serif" }}>
              Fill in the details below and we'll get your waste collected.
            </p>
          </div>

          {/* Card: Basic Info */}
          <div className="cr-card">
            <p className="cr-section-label">Request Details</p>

            <FieldWrap>
              <Label icon={ICONS.title} text="Request Title" required />
              <input
                style={{ ...inputStyle("title"), ...(form.title ? {} : {}) }}
                placeholder="e.g., Concrete debris clearance"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                onFocus={() => setFocused("title")}
                onBlur={() => setFocused(null)}
              />
            </FieldWrap>

            <div className="cr-divider" />

            <FieldWrap>
              <Label icon={ICONS.wasteType} text="Waste Type" required />
              <div className="cr-waste-grid">
                {WASTE_TYPES.map((type) => {
                  const c = WASTE_TYPE_CONFIG[type as keyof typeof WASTE_TYPE_CONFIG];
                  const active = form.wasteType === type;
                  return (
                    <button
                      key={type}
                      className="cr-waste-btn"
                      onClick={() => set("wasteType", type)}
                      style={active ? {
                        background: c.bg, color: c.color,
                        border: `1.5px solid ${c.border}`,
                      } : {}}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </FieldWrap>

            <div className="cr-divider" />

            <FieldWrap>
              <Label icon={ICONS.quantity} text="Estimated Quantity" required />
              <input
                style={inputStyle("quantity")}
                placeholder="e.g., 5 cubic meters, 2 tons, 3 truckloads"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                onFocus={() => setFocused("quantity")}
                onBlur={() => setFocused(null)}
              />
            </FieldWrap>
          </div>

          {/* Card: Location & Schedule */}
          <div className="cr-card">
            <p className="cr-section-label">Location & Schedule</p>

            <FieldWrap>
              <Label icon={ICONS.location} text="Pickup Location" required />
              <input
                style={inputStyle("location")}
                placeholder="Full address of the pickup site"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                onFocus={() => setFocused("location")}
                onBlur={() => setFocused(null)}
              />
            </FieldWrap>

            <div className="cr-divider" />

            <div className="cr-grid-2">
              <FieldWrap>
                <Label icon={ICONS.calendar} text="Pickup Window Start" required />
                <input
                  type="datetime-local"
                  style={inputStyle("windowStart")}
                  value={form.windowStart}
                  onChange={(e) => set("windowStart", e.target.value)}
                  onFocus={() => setFocused("windowStart")}
                  onBlur={() => setFocused(null)}
                />
              </FieldWrap>
              <FieldWrap>
                <Label icon={ICONS.calendar} text="Pickup Window End" required />
                <input
                  type="datetime-local"
                  style={inputStyle("windowEnd")}
                  value={form.windowEnd}
                  onChange={(e) => set("windowEnd", e.target.value)}
                  onFocus={() => setFocused("windowEnd")}
                  onBlur={() => setFocused(null)}
                />
              </FieldWrap>
            </div>
          </div>

          {/* Card: Notes */}
          <div className="cr-card">
            <p className="cr-section-label">Additional Information</p>
            <FieldWrap>
              <Label icon={ICONS.note} text="Notes & Special Instructions" />
              <textarea
                className="cr-textarea"
                placeholder="Any special handling requirements, access instructions, or additional information..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </FieldWrap>
          </div>

          {/* Actions */}
          <div className="cr-actions">
            <button className="cr-btn-cancel" onClick={() => window.history.back()}>
              Cancel
            </button>
            <button
              className={`cr-btn-submit ${isValid ? "active" : "disabled"}`}
              onClick={handleSubmit}
              disabled={!isValid}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Create Request
            </button>
          </div>

        </div>
        </div>
        </main>
      </div>
    </>
  );
}
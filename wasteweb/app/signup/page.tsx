"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

type Role = "operator" | "contractor";

function Input({
  label, type = "text", placeholder, error, leftIcon, required: req, hint, ...props
}: {
  label?: string; type?: string; placeholder?: string; error?: string;
  leftIcon?: React.ReactNode; required?: boolean; hint?: string;
  [k: string]: any;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2a5c38", fontFamily: "'Quicksand',sans-serif", letterSpacing: "0.01em" }}>
          {label}{req && <span style={{ color: "#B8D52E", marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {leftIcon && (
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#3d6b4d", pointerEvents: "none", display: "flex", alignItems: "center" }}>
            {leftIcon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: leftIcon ? "11px 14px 11px 38px" : "11px 14px",
            borderRadius: 10,
            border: error ? "1px solid #e05c5c" : "1px solid #c6e2d0",
            background: "#f5faf6",
            color: "#1a2e1f",
            fontSize: "0.875rem",
            fontWeight: 600,
            fontFamily: "'Quicksand',sans-serif",
            outline: "none",
            boxSizing: "border-box",
            transition: "border 0.18s, box-shadow 0.18s",
          }}
          onFocus={e => { e.currentTarget.style.border = "1px solid #B8D52E"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,213,46,0.15)"; }}
          onBlur={e => { e.currentTarget.style.border = error ? "1px solid #e05c5c" : "1px solid #c6e2d0"; e.currentTarget.style.boxShadow = "none"; }}
          {...props}
        />
      </div>
      {hint && !error && <span style={{ fontSize: "0.71rem", color: "#8aab97", fontFamily: "'Quicksand',sans-serif", fontWeight: 600 }}>{hint}</span>}
      {error && <span style={{ fontSize: "0.72rem", color: "#e05c5c", fontFamily: "'Quicksand',sans-serif", fontWeight: 600 }}>{error}</span>}
    </div>
  );
}

function Select({ label, error, required: req, children, hint, ...props }: {
  label?: string; error?: string; required?: boolean; children: React.ReactNode; hint?: string; [k: string]: any;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2a5c38", fontFamily: "'Quicksand',sans-serif" }}>
          {label}{req && <span style={{ color: "#B8D52E", marginLeft: 2 }}>*</span>}
        </label>
      )}
      <select
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 10,
          border: error ? "1px solid #e05c5c" : "1px solid #c6e2d0",
          background: "#f5faf6", color: "#1a2e1f", fontSize: "0.875rem",
          fontWeight: 600, fontFamily: "'Quicksand',sans-serif", outline: "none",
          boxSizing: "border-box", transition: "border 0.18s",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233d6b4d' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
        } as React.CSSProperties}
        onFocus={e => { e.currentTarget.style.border = "1px solid #B8D52E"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,213,46,0.15)"; }}
        onBlur={e => { e.currentTarget.style.border = error ? "1px solid #e05c5c" : "1px solid #c6e2d0"; e.currentTarget.style.boxShadow = "none"; }}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <span style={{ fontSize: "0.71rem", color: "#8aab97", fontFamily: "'Quicksand',sans-serif", fontWeight: 600 }}>{hint}</span>}
      {error && <span style={{ fontSize: "0.72rem", color: "#e05c5c", fontFamily: "'Quicksand',sans-serif", fontWeight: 600 }}>{error}</span>}
    </div>
  );
}

function Textarea({ label, error, required: req, hint, ...props }: {
  label?: string; error?: string; required?: boolean; hint?: string; [k: string]: any;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2a5c38", fontFamily: "'Quicksand',sans-serif" }}>
          {label}{req && <span style={{ color: "#B8D52E", marginLeft: 2 }}>*</span>}
        </label>
      )}
      <textarea
        rows={3}
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 10,
          border: error ? "1px solid #e05c5c" : "1px solid #c6e2d0",
          background: "#f5faf6", color: "#1a2e1f", fontSize: "0.875rem",
          fontWeight: 600, fontFamily: "'Quicksand',sans-serif", outline: "none",
          boxSizing: "border-box", resize: "vertical", minHeight: 80,
          transition: "border 0.18s, box-shadow 0.18s",
        } as React.CSSProperties}
        onFocus={e => { e.currentTarget.style.border = "1px solid #B8D52E"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,213,46,0.15)"; }}
        onBlur={e => { e.currentTarget.style.border = error ? "1px solid #e05c5c" : "1px solid #c6e2d0"; e.currentTarget.style.boxShadow = "none"; }}
        {...props}
      />
      {hint && !error && <span style={{ fontSize: "0.71rem", color: "#8aab97", fontFamily: "'Quicksand',sans-serif", fontWeight: 600 }}>{hint}</span>}
      {error && <span style={{ fontSize: "0.72rem", color: "#e05c5c", fontFamily: "'Quicksand',sans-serif", fontWeight: 600 }}>{error}</span>}
    </div>
  );
}

function FileUpload({ label, hint, error, accept, required: req, onChange }: {
  label?: string; hint?: string; error?: string; accept?: string; required?: boolean;
  onChange?: (f: File | null) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2a5c38", fontFamily: "'Quicksand',sans-serif" }}>
          {label}{req && <span style={{ color: "#B8D52E", marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div
        onClick={() => ref.current?.click()}
        style={{
          border: error ? "1.5px dashed #e05c5c" : "1.5px dashed #c6e2d0",
          borderRadius: 10, padding: "14px 16px", cursor: "pointer",
          background: "#f5faf6", display: "flex", alignItems: "center", gap: 10,
          transition: "border 0.18s, background 0.18s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "#eef7f1"; (e.currentTarget as HTMLDivElement).style.border = "1.5px dashed #B8D52E"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "#f5faf6"; (e.currentTarget as HTMLDivElement).style.border = error ? "1.5px dashed #e05c5c" : "1.5px dashed #c6e2d0"; }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#3d6b4d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, flexShrink: 0 }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <div>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1a2e1f", fontFamily: "'Quicksand',sans-serif", margin: 0 }}>
            {fileName ?? "Click to upload"}
          </p>
          {hint && <p style={{ fontSize: "0.7rem", color: "#8aab97", fontFamily: "'Quicksand',sans-serif", margin: 0, fontWeight: 600 }}>{hint}</p>}
        </div>
        <input ref={ref} type="file" accept={accept} style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0] ?? null; setFileName(f?.name ?? null); onChange?.(f); }} />
      </div>
      {error && <span style={{ fontSize: "0.72rem", color: "#e05c5c", fontFamily: "'Quicksand',sans-serif", fontWeight: 600 }}>{error}</span>}
    </div>
  );
}

function PasswordInput({ label, placeholder, error, ...props }: { label?: string; placeholder?: string; error?: string; [k: string]: any }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2a5c38", fontFamily: "'Quicksand',sans-serif" }}>
          {label}<span style={{ color: "#B8D52E", marginLeft: 2 }}>*</span>
        </label>
      )}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#3d6b4d", pointerEvents: "none", display: "flex", alignItems: "center" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </span>
        <input
          type={show ? "text" : "password"} placeholder={placeholder}
          style={{ width: "100%", padding: "11px 40px 11px 38px", borderRadius: 10, border: error ? "1px solid #e05c5c" : "1px solid #c6e2d0", background: "#f5faf6", color: "#1a2e1f", fontSize: "0.875rem", fontWeight: 600, fontFamily: "'Quicksand',sans-serif", outline: "none", boxSizing: "border-box", transition: "border 0.18s, box-shadow 0.18s" }}
          onFocus={e => { e.currentTarget.style.border = "1px solid #B8D52E"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,213,46,0.15)"; }}
          onBlur={e => { e.currentTarget.style.border = error ? "1px solid #e05c5c" : "1px solid #c6e2d0"; e.currentTarget.style.boxShadow = "none"; }}
          {...props}
        />
        <button type="button" tabIndex={-1} onClick={() => setShow(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#3d6b4d", padding: 0, display: "flex", alignItems: "center" }}>
          {show ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      </div>
      {error && <span style={{ fontSize: "0.72rem", color: "#e05c5c", fontFamily: "'Quicksand',sans-serif", fontWeight: 600 }}>{error}</span>}
    </div>
  );
}

function Checkbox({ label, error, checked, onChange }: { label: React.ReactNode; error?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
        <div
          onClick={() => onChange(!checked)}
          style={{
            width: 18, height: 18, borderRadius: 5, flexShrink: 0,
            border: error ? "1.5px solid #e05c5c" : checked ? "1.5px solid #1a4d2e" : "1.5px solid #c6e2d0",
            background: checked ? "#1a4d2e" : "#f5faf6",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.18s", marginTop: 1,
          }}
        >
          {checked && <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1a2e1f", fontFamily: "'Quicksand',sans-serif", lineHeight: 1.5 }}>{label}</span>
      </label>
      {error && <span style={{ fontSize: "0.72rem", color: "#e05c5c", fontFamily: "'Quicksand',sans-serif", fontWeight: 600, marginLeft: 28 }}>{error}</span>}
    </div>
  );
}

function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < total - 1 ? 1 : 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: i < current ? "#1a4d2e" : i === current ? "#1a4d2e" : "#f0f7f2",
              border: i === current ? "2px solid #B8D52E" : i < current ? "2px solid #1a4d2e" : "2px solid #c6e2d0",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s",
            }}>
              {i < current ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: i === current ? "#B8D52E" : "#9ab8a5", fontFamily: "'Quicksand',sans-serif" }}>{i + 1}</span>
              )}
            </div>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: i === current ? "#1a4d2e" : i < current ? "#3d6b4d" : "#9ab8a5", fontFamily: "'Quicksand',sans-serif", whiteSpace: "nowrap" }}>
              {labels[i]}
            </span>
          </div>
          {i < total - 1 && (
            <div style={{ flex: 1, height: 2, background: i < current ? "#1a4d2e" : "#e8f2eb", marginBottom: 18, marginLeft: 4, marginRight: 4, transition: "background 0.3s" }} />
          )}
        </div>
      ))}
    </div>
  );
}

function NavBtn({ children, onClick, variant = "primary", loading, fullWidth }: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary" | "ghost"; loading?: boolean; fullWidth?: boolean;
}) {
  const isPrimary = variant === "primary";
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      style={{
        width: fullWidth ? "100%" : "auto",
        padding: "13px 22px", borderRadius: 10,
        background: isPrimary ? (loading ? "#2a5c38" : "#1a4d2e") : "transparent",
        color: isPrimary ? "#e8f5ee" : "#1a4d2e",
        border: isPrimary ? "none" : "1.5px solid #c6e2d0",
        fontSize: "0.9rem", fontWeight: 700, fontFamily: "'Quicksand',sans-serif",
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        transition: "all 0.18s", opacity: loading ? 0.75 : 1,
        boxShadow: isPrimary ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
      }}
      onMouseEnter={e => {
        if (!loading) {
          if (isPrimary) { e.currentTarget.style.background = "#0f2d1a"; e.currentTarget.style.transform = "translateY(-1px)"; }
          else { e.currentTarget.style.borderColor = "#1a4d2e"; e.currentTarget.style.background = "#f5faf6"; }
        }
      }}
      onMouseLeave={e => {
        if (isPrimary) { e.currentTarget.style.background = loading ? "#2a5c38" : "#1a4d2e"; e.currentTarget.style.transform = "none"; }
        else { e.currentTarget.style.borderColor = "#c6e2d0"; e.currentTarget.style.background = "transparent"; }
      }}
    >
      {loading ? (
        <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14, animation: "wfSpin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Creating…</>
      ) : children}
    </button>
  );
}

const OPERATOR_LABELS = ["Account", "Business & Site", "Waste Profile"];

function OperatorStep1({ data, setData, errors }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Input label="Full Name (Contact Person)" placeholder="Jane Doe" required value={data.fullName} onChange={(e: any) => setData({ ...data, fullName: e.target.value })} error={errors.fullName}
        leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
      />
      <Input label="Email Address" type="email" placeholder="you@company.co.uk" required value={data.email} onChange={(e: any) => setData({ ...data, email: e.target.value })} error={errors.email}
        leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
      />
      <PasswordInput label="Password" placeholder="Create a strong password" value={data.password} onChange={(e: any) => setData({ ...data, password: e.target.value })} error={errors.password} />
      <Input label="Phone Number" type="tel" placeholder="+44 7700 900000" required value={data.phone} onChange={(e: any) => setData({ ...data, phone: e.target.value })} error={errors.phone}
        leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.93-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.92 16.92z"/></svg>}
      />
    </div>
  );
}

function OperatorStep2({ data, setData, errors }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Input label="Company / Organisation Name" placeholder="Buildright Ltd." required value={data.companyName} onChange={(e: any) => setData({ ...data, companyName: e.target.value })} error={errors.companyName} />
      <Input label="Companies House Registration Number" placeholder="12345678" required value={data.regNumber} onChange={(e: any) => setData({ ...data, regNumber: e.target.value })} error={errors.regNumber} hint="8-digit number from Companies House" />
      <Select label="Industry / Sector" required value={data.industry} onChange={(e: any) => setData({ ...data, industry: e.target.value })} error={errors.industry}>
        <option value="">Select industry…</option>
        <option value="construction">Construction</option>
        <option value="demolition">Demolition</option>
        <option value="renovation">Renovation & Refurbishment</option>
        <option value="civil">Civil Engineering</option>
        <option value="housebuilding">Housebuilding</option>
        <option value="other">Other</option>
      </Select>
      <Input label="VAT Number" placeholder="GB 123 4567 89" value={data.vatNumber} onChange={(e: any) => setData({ ...data, vatNumber: e.target.value })} hint="Optional — common for UK B2B billing" />
      <div style={{ height: 1, background: "#eef7f1" }} />
      <p style={{ fontSize: "0.76rem", fontWeight: 700, color: "#2a5c38", fontFamily: "'Quicksand',sans-serif", margin: "2px 0 -4px" }}>Site / Location</p>
      <Input label="Site Address" placeholder="123 Construction Way" required value={data.siteAddress} onChange={(e: any) => setData({ ...data, siteAddress: e.target.value })} error={errors.siteAddress} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Postcode" placeholder="EC1A 1BB" required value={data.postcode} onChange={(e: any) => setData({ ...data, postcode: e.target.value })} error={errors.postcode} />
        <Input label="City / Region" placeholder="London" required value={data.city} onChange={(e: any) => setData({ ...data, city: e.target.value })} error={errors.city} />
      </div>
    </div>
  );
}

const WASTE_TYPES = ["Concrete & Masonry", "Timber & Wood", "Metals & Steel", "Plasterboard", "Plastics", "Glass", "Mixed Construction", "Hazardous / Specialist"];

function OperatorStep3({ data, setData, errors }: any) {
  const toggleWaste = (type: string) => {
    const cur: string[] = data.wasteTypes ?? [];
    setData({ ...data, wasteTypes: cur.includes(type) ? cur.filter((t: string) => t !== type) : [...cur, type] });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2a5c38", fontFamily: "'Quicksand',sans-serif", display: "block", marginBottom: 8 }}>
          Types of Waste / Debris<span style={{ color: "#B8D52E", marginLeft: 2 }}>*</span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {WASTE_TYPES.map(t => {
            const active = (data.wasteTypes ?? []).includes(t);
            return (
              <button key={t} type="button" onClick={() => toggleWaste(t)} style={{
                padding: "7px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700,
                fontFamily: "'Quicksand',sans-serif", cursor: "pointer", transition: "all 0.18s",
                background: active ? "#1a4d2e" : "#f0f7f2",
                color: active ? "#e8f5ee" : "#3d6b4d",
                border: active ? "1.5px solid #1a4d2e" : "1.5px solid #c6e2d0",
              }}>
                {active && "✓ "}{t}
              </button>
            );
          })}
        </div>
        {errors.wasteTypes && <span style={{ fontSize: "0.72rem", color: "#e05c5c", fontFamily: "'Quicksand',sans-serif", fontWeight: 600, marginTop: 4, display: "block" }}>{errors.wasteTypes}</span>}
      </div>
      <Select label="Estimated Disposal Frequency" required value={data.frequency} onChange={(e: any) => setData({ ...data, frequency: e.target.value })} error={errors.frequency}>
        <option value="">Select frequency…</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="fortnightly">Fortnightly</option>
        <option value="monthly">Monthly</option>
        <option value="adhoc">Ad hoc / One-off</option>
      </Select>
      <Input label="Estimated Volume per Collection" placeholder="e.g. 8 cubic yards, 2 skips" value={data.volume} onChange={(e: any) => setData({ ...data, volume: e.target.value })} hint="Approximate size helps us match you with the right contractor" />
      <div style={{ height: 1, background: "#eef7f1" }} />
      <p style={{ fontSize: "0.76rem", fontWeight: 700, color: "#2a5c38", fontFamily: "'Quicksand',sans-serif", margin: "2px 0 -4px" }}>Verification</p>
      <Input label="Companies House Number" placeholder="12345678" value={data.companiesHouse} onChange={(e: any) => setData({ ...data, companiesHouse: e.target.value })} hint="Used to verify your business registration" />
      <FileUpload label="Proof of Business (optional)" hint="Upload Companies House certificate or equivalent" accept=".pdf,.jpg,.png" />
      <Checkbox
        checked={data.terms ?? false}
        onChange={v => setData({ ...data, terms: v })}
        error={errors.terms}
        label={<>I agree to the <a href="#" style={{ color: "#1a4d2e" }}>Terms & Conditions</a> and <a href="#" style={{ color: "#1a4d2e" }}>Privacy Policy</a></>}
      />
    </div>
  );
}

const CONTRACTOR_LABELS = ["Account", "Business Info", "Compliance"];

function ContractorStep1({ data, setData, errors }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Input label="Full Name (Primary Contact)" placeholder="John Smith" required value={data.fullName} onChange={(e: any) => setData({ ...data, fullName: e.target.value })} error={errors.fullName}
        leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
      />
      <Input label="Email Address" type="email" placeholder="you@company.co.uk" required value={data.email} onChange={(e: any) => setData({ ...data, email: e.target.value })} error={errors.email}
        leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
      />
      <PasswordInput label="Password" placeholder="Create a strong password" value={data.password} onChange={(e: any) => setData({ ...data, password: e.target.value })} error={errors.password} />
      <Input label="Phone Number" type="tel" placeholder="+44 7700 900000" required value={data.phone} onChange={(e: any) => setData({ ...data, phone: e.target.value })} error={errors.phone}
        leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.93-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.92 16.92z"/></svg>}
      />
    </div>
  );
}

function ContractorStep2({ data, setData, errors }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Input label="Company / Organisation Name" placeholder="GreenHaul Services Ltd." required value={data.companyName} onChange={(e: any) => setData({ ...data, companyName: e.target.value })} error={errors.companyName} />
      <Input label="Companies House Registration Number" placeholder="12345678" required value={data.regNumber} onChange={(e: any) => setData({ ...data, regNumber: e.target.value })} error={errors.regNumber} hint="8-digit number from Companies House" />
      <Input label="VAT Number" placeholder="GB 123 4567 89" value={data.vatNumber} onChange={(e: any) => setData({ ...data, vatNumber: e.target.value })} />
      <Input label="Years in Operation" type="number" placeholder="e.g. 5" required value={data.yearsOp} onChange={(e: any) => setData({ ...data, yearsOp: e.target.value })} error={errors.yearsOp} />
      <Textarea label="Service Area(s) / Postcodes Covered" placeholder="e.g. EC1, EC2, WC1, N1 — or describe your region" required value={data.serviceArea} onChange={(e: any) => setData({ ...data, serviceArea: e.target.value })} error={errors.serviceArea} hint="List postcodes, districts, or regions you cover" />
      <div>
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2a5c38", fontFamily: "'Quicksand',sans-serif", display: "block", marginBottom: 8 }}>
          Types of Waste Handled<span style={{ color: "#B8D52E", marginLeft: 2 }}>*</span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {["Recycling", "Reuse / Repurpose", "Landfill", "Inert Waste", "Hazardous / Specialist", "Skip Hire", "Bulk Clearance"].map(t => {
            const active = (data.wasteHandled ?? []).includes(t);
            return (
              <button key={t} type="button" onClick={() => {
                const cur: string[] = data.wasteHandled ?? [];
                setData({ ...data, wasteHandled: active ? cur.filter((x: string) => x !== t) : [...cur, t] });
              }} style={{
                padding: "7px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700,
                fontFamily: "'Quicksand',sans-serif", cursor: "pointer", transition: "all 0.18s",
                background: active ? "#1a4d2e" : "#f0f7f2",
                color: active ? "#e8f5ee" : "#3d6b4d",
                border: active ? "1.5px solid #1a4d2e" : "1.5px solid #c6e2d0",
              }}>
                {active && "✓ "}{t}
              </button>
            );
          })}
        </div>
        {errors.wasteHandled && <span style={{ fontSize: "0.72rem", color: "#e05c5c", fontFamily: "'Quicksand',sans-serif", fontWeight: 600, marginTop: 4, display: "block" }}>{errors.wasteHandled}</span>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Number of Vehicles" type="number" placeholder="e.g. 6" value={data.vehicles} onChange={(e: any) => setData({ ...data, vehicles: e.target.value })} hint="Optional" />
        <Input label="Tonnage Capacity" placeholder="e.g. 20t per day" value={data.tonnage} onChange={(e: any) => setData({ ...data, tonnage: e.target.value })} hint="Optional" />
      </div>
    </div>
  );
}

function ContractorStep3({ data, setData, errors }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#fffbe6", border: "1px solid #f0d97a", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p style={{ fontSize: "0.76rem", color: "#7a5c00", fontFamily: "'Quicksand',sans-serif", fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
          A valid <strong>EA Waste Carrier Licence</strong> is a legal requirement in the UK for collecting and transporting waste. Your application cannot be approved without one.
        </p>
      </div>
      <FileUpload label="EA Waste Carrier Licence" required hint="Upload PDF, JPG, or PNG — must be current and valid" accept=".pdf,.jpg,.png" onChange={f => setData({ ...data, wasteCarrierDoc: f })} />
      {errors.wasteCarrierDoc && <span style={{ fontSize: "0.72rem", color: "#e05c5c", fontFamily: "'Quicksand',sans-serif", fontWeight: 600, marginTop: -8 }}>{errors.wasteCarrierDoc}</span>}
      <Input label="Waste Carrier Licence Number" placeholder="CBDU123456" required value={data.wasteCarrierNum} onChange={(e: any) => setData({ ...data, wasteCarrierNum: e.target.value })} error={errors.wasteCarrierNum} hint="Found on your Environment Agency registration" />
      <Textarea label="Certifications & Other Licences" placeholder="e.g. ISO 14001, Hazardous Waste Consignee, SSAIB..." value={data.certs} onChange={(e: any) => setData({ ...data, certs: e.target.value })} hint="List any additional relevant certifications" />
      <div style={{ height: 1, background: "#eef7f1" }} />
      <p style={{ fontSize: "0.76rem", fontWeight: 700, color: "#2a5c38", fontFamily: "'Quicksand',sans-serif", margin: "2px 0 -4px" }}>Insurance</p>
      <Input label="Public Liability Insurance Provider" placeholder="e.g. Hiscox, AXA, Aviva" required value={data.insuranceProvider} onChange={(e: any) => setData({ ...data, insuranceProvider: e.target.value })} error={errors.insuranceProvider} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Policy Number" placeholder="PLI-XXXXXXX" required value={data.policyNumber} onChange={(e: any) => setData({ ...data, policyNumber: e.target.value })} error={errors.policyNumber} />
        <Input label="Coverage Amount" placeholder="e.g. £5,000,000" required value={data.coverage} onChange={(e: any) => setData({ ...data, coverage: e.target.value })} error={errors.coverage} />
      </div>
      <div style={{ height: 1, background: "#eef7f1" }} />
      <Checkbox
        checked={data.terms ?? false}
        onChange={v => setData({ ...data, terms: v })}
        error={errors.terms}
        label={<>I agree to the <a href="#" style={{ color: "#1a4d2e" }}>Platform Terms</a>, <a href="#" style={{ color: "#1a4d2e" }}>Contractor Code of Conduct</a>, and <a href="#" style={{ color: "#1a4d2e" }}>Privacy Policy</a></>}
      />
    </div>
  );
}

export default function SignupPage() {
  const [role, setRole] = useState<Role>("operator");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [opData, setOpData] = useState<Record<string, any>>({});
  const [coData, setCoData] = useState<Record<string, any>>({});

  const data = role === "operator" ? opData : coData;
  const setData = role === "operator" ? setOpData : setCoData;

  const totalSteps = 3;
  const labels = role === "operator" ? OPERATOR_LABELS : CONTRACTOR_LABELS;

  const validateStep = () => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!data.fullName) errs.fullName = "Full name is required";
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "Valid email is required";
      if (!data.password || data.password.length < 8) errs.password = "Password must be at least 8 characters";
      if (!data.phone) errs.phone = "Phone number is required";
    }
    if (step === 1) {
      if (!data.companyName) errs.companyName = "Company name is required";
      if (!data.regNumber) errs.regNumber = "Registration number is required";
      if (role === "operator") {
        if (!data.industry) errs.industry = "Please select an industry";
        if (!data.siteAddress) errs.siteAddress = "Site address is required";
        if (!data.postcode) errs.postcode = "Postcode is required";
        if (!data.city) errs.city = "City is required";
      } else {
        if (!data.yearsOp) errs.yearsOp = "Years in operation is required";
        if (!data.serviceArea) errs.serviceArea = "Service area is required";
        if (!data.wasteHandled?.length) errs.wasteHandled = "Select at least one type";
      }
    }
    if (step === 2) {
      if (role === "operator") {
        if (!data.wasteTypes?.length) errs.wasteTypes = "Select at least one waste type";
        if (!data.frequency) errs.frequency = "Please select disposal frequency";
        if (!data.terms) errs.terms = "You must agree to the terms";
      } else {
        if (!data.wasteCarrierNum) errs.wasteCarrierNum = "Licence number is required";
        if (!data.insuranceProvider) errs.insuranceProvider = "Insurance provider is required";
        if (!data.policyNumber) errs.policyNumber = "Policy number is required";
        if (!data.coverage) errs.coverage = "Coverage amount is required";
        if (!data.terms) errs.terms = "You must agree to the terms";
      }
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const handleBack = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = async () => {
    const errs = validateStep();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
    window.location.href = role === "operator" ? "/operator/dashboard" : "/contractor/dashboard";
  };

  const stepHeadings: Record<Role, string[]> = {
    operator: ["Create your account", "Business & site details", "Waste profile & verification"],
    contractor: ["Create your account", "Business information", "Compliance & verification"],
  };
  const stepSubs: Record<Role, string[]> = {
    operator: ["Your contact details for the account.", "Tell us about your company and site location.", "What waste you generate and business verification."],
    contractor: ["Your contact details for the account.", "Tell us about your waste collection business.", "Licences, insurance, and legal compliance."],
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        @keyframes wfSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes wfFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes wfBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wf-su-root { height: 100vh; display: flex; overflow: hidden; font-family: 'Quicksand', sans-serif; }

        .wf-su-hero { display: none; position: relative; flex-direction: column; justify-content: flex-end; }
        @media (min-width: 1024px) { .wf-su-hero { display: flex; width: 42%; } }
        .wf-su-hero-scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgba(5,15,8,0.85) 0%, rgba(5,15,8,0.55) 45%, rgba(5,15,8,0.35) 100%); z-index: 1; }
        .wf-su-hero::after { content: ''; position: absolute; top: 0; right: 0; width: 3px; height: 100%; background: linear-gradient(to bottom, transparent, #B8D52E, transparent); opacity: 0.55; z-index: 10; }
        .wf-su-hero-content { position: relative; z-index: 2; padding: 44px; }

        .wf-su-panel { width: 100%; display: flex; flex-direction: column; background: #ffffff; overflow: hidden; }
        @media (min-width: 1024px) { .wf-su-panel { width: 58%; } }

        .wf-su-header { flex-shrink: 0; padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f0f7f2; }

        .wf-su-scroll { flex: 1; overflow-y: auto; display: flex; align-items: flex-start; padding: 28px 32px; }
        .wf-su-inner { max-width: 480px; width: 100%; margin: 0 auto; animation: wfFadeUp 0.4s ease both; }

        .wf-su-footer { flex-shrink: 0; border-top: 1px solid #f0f7f2; padding: 13px 32px; display: flex; flex-direction: column; gap: 4px; align-items: center; justify-content: space-between; }
        @media (min-width: 500px) { .wf-su-footer { flex-direction: row; } }
        .wf-su-footer-copy { font-size: 0.72rem; color: #9ab8a5; font-weight: 600; font-family: 'Quicksand', sans-serif; }
        .wf-su-footer-links { display: flex; gap: 16px; }
        .wf-su-footer-links a { font-size: 0.72rem; color: #9ab8a5; text-decoration: none; font-weight: 600; transition: color 0.18s; font-family: 'Quicksand', sans-serif; }
        .wf-su-footer-links a:hover { color: #1a4d2e; }

        .wf-su-toggle { display: flex; background: #f0f7f2; border-radius: 10px; padding: 4px; margin-bottom: 22px; gap: 2px; }
        .wf-su-toggle-btn { flex: 1; padding: 9px 8px; border-radius: 7px; border: none; font-size: 0.8rem; font-weight: 700; font-family: 'Quicksand', sans-serif; cursor: pointer; transition: all 0.2s; background: transparent; color: #6b8f7a; }
        .wf-su-toggle-btn.active { background: #ffffff; color: #1a2e1f; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      `}</style>

      <div className="wf-su-root">

        <div className="wf-su-hero">
          <Image src="/truck2.png" alt="WasteFlow" fill style={{ objectFit: "cover", objectPosition: "center" }} sizes="42vw" />
          <div className="wf-su-hero-scrim" />
          <div className="wf-su-hero-content">
            <p style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: "clamp(1.3rem, 2.2vw, 1.75rem)", color: "#e8f5ee", lineHeight: 1.3, letterSpacing: "-0.02em", marginBottom: 12 }}>
              Join the smarter way to manage construction waste.
            </p>
            <p style={{ fontFamily: "'Quicksand',sans-serif", fontSize: "0.85rem", color: "#5a8a6a", fontWeight: 600, lineHeight: 1.65 }}>
              Connect your site with trusted waste contractors — compliantly, efficiently, sustainably.
            </p>
          </div>
        </div>

        <div className="wf-su-panel">
          <div className="wf-su-header">
            {step > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#4a7a5a", display: "flex", alignItems: "center", transition: "color 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#1a4d2e")}
                onMouseLeave={e => (e.currentTarget.style.color = "#4a7a5a")}
                aria-label="Go back"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            ) : <span />}
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#9ab8a5", fontFamily: "'Quicksand',sans-serif" }}>
              Step {step + 1} of {totalSteps}
            </span>
          </div>

          <div className="wf-su-scroll">
            <div className="wf-su-inner" key={`${role}-${step}`}>

              {step === 0 && (
                <div className="wf-su-toggle">
                  {(["operator", "contractor"] as Role[]).map(r => (
                    <button key={r} type="button" className={`wf-su-toggle-btn${role === r ? " active" : ""}`}
                      onClick={() => { setRole(r); setStep(0); setErrors({}); }}>
                      {r === "contractor" ? "🚛 Contractor (I have a site)" : r === "operator" ? "🏗 Operator (I have a lorry)" : ""}
                    </button>
                  ))}
                </div>
              )}

              <StepIndicator current={step} total={totalSteps} labels={labels} />

              <h1 style={{ fontSize: "1.55rem", fontWeight: 700, color: "#1a2e1f", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 4, fontFamily: "'Quicksand',sans-serif" }}>
                {stepHeadings[role][step]}
              </h1>
              <p style={{ fontSize: "0.875rem", color: "#6b8f7a", fontWeight: 600, marginBottom: 22, lineHeight: 1.55, fontFamily: "'Quicksand',sans-serif" }}>
                {stepSubs[role][step]}
              </p>

              {role === "operator" && step === 0 && <OperatorStep1 data={opData} setData={setOpData} errors={errors} />}
              {role === "operator" && step === 1 && <OperatorStep2 data={opData} setData={setOpData} errors={errors} />}
              {role === "operator" && step === 2 && <OperatorStep3 data={opData} setData={setOpData} errors={errors} />}
              {role === "contractor" && step === 0 && <ContractorStep1 data={coData} setData={setCoData} errors={errors} />}
              {role === "contractor" && step === 1 && <ContractorStep2 data={coData} setData={setCoData} errors={errors} />}
              {role === "contractor" && step === 2 && <ContractorStep3 data={coData} setData={setCoData} errors={errors} />}

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f0f7f2" }}>

                {step === 0 && (
                  <p style={{ textAlign: "center", fontSize: "0.8rem", fontWeight: 600, color: "#6b8f7a", fontFamily: "'Quicksand',sans-serif", marginBottom: 14 }}>
                    Already have an account?{" "}
                    <Link href="/login" style={{ color: "#1a4d2e", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
                  </p>
                )}

                {step < totalSteps - 1 ? (
                  <NavBtn onClick={handleNext} fullWidth>
                    Continue
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </NavBtn>
                ) : (
                  <NavBtn onClick={handleSubmit} loading={loading} fullWidth>
                    Create Account
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </NavBtn>
                )}

              </div>

            </div>
          </div>

          <footer className="wf-su-footer">
            <span className="wf-su-footer-copy">© {new Date().getFullYear()} WasteFlow. All rights reserved.</span>
            <div className="wf-su-footer-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Contact</a>
            </div>
          </footer>
        </div>

      </div>
    </>
  );
}
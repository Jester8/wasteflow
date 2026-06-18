"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { updateUserKYC } from "@/lib/firestore";

type Role = "operator" | "contractor";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

async function uploadToCloudinary(
  file: File,
  folder: string,
  onProgress: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve(res.secure_url as string);
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.send(formData);
  });
}

function Input({ label, type = "text", placeholder, error, leftIcon, required: req, hint, ...props }: {
  label?: string; type?: string; placeholder?: string; error?: string;
  leftIcon?: React.ReactNode; required?: boolean; hint?: string; [k: string]: any;
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
            background: "#f5faf6", color: "#1a2e1f", fontSize: "0.875rem",
            fontWeight: 600, fontFamily: "'Quicksand',sans-serif", outline: "none",
            boxSizing: "border-box", transition: "border 0.18s, box-shadow 0.18s",
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
          boxSizing: "border-box", appearance: "none",
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

function FileUpload({ label, hint, error, accept, required: req, onChange, uploadedName }: {
  label?: string; hint?: string; error?: string; accept?: string; required?: boolean;
  onChange?: (f: File | null) => void; uploadedName?: string | null;
}) {
  const [fileName, setFileName] = useState<string | null>(uploadedName ?? null);
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2a5c38", fontFamily: "'Quicksand',sans-serif" }}>
          {label}{req && <span style={{ color: "#B8D52E", marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          border: error ? "1.5px dashed #e05c5c" : fileName ? "1.5px dashed #1a4d2e" : "1.5px dashed #c6e2d0",
          borderRadius: 10, padding: "14px 16px", cursor: "pointer",
          background: fileName ? "#f0f7f2" : "#f5faf6",
          display: "flex", alignItems: "center", gap: 10,
          transition: "border 0.18s, background 0.18s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "#eef7f1"; (e.currentTarget as HTMLDivElement).style.border = "1.5px dashed #B8D52E"; }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.background = fileName ? "#f0f7f2" : "#f5faf6";
          (e.currentTarget as HTMLDivElement).style.border = error ? "1.5px dashed #e05c5c" : fileName ? "1.5px dashed #1a4d2e" : "1.5px dashed #c6e2d0";
        }}
      >
        {fileName ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="#1a4d2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, flexShrink: 0 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="#3d6b4d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, flexShrink: 0 }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: fileName ? "#1a4d2e" : "#1a2e1f", fontFamily: "'Quicksand',sans-serif", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fileName ?? "Click to upload"}
          </p>
          {hint && <p style={{ fontSize: "0.7rem", color: "#8aab97", fontFamily: "'Quicksand',sans-serif", margin: 0, fontWeight: 600 }}>{hint}</p>}
        </div>
        {fileName && (
          <button type="button" onClick={e => { e.stopPropagation(); setFileName(null); onChange?.(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ab8a5", padding: 2, display: "flex", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}
        <input ref={fileRef} type="file" accept={accept} style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0] ?? null; setFileName(f?.name ?? null); onChange?.(f); }} />
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
          {checked && <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}><polyline points="20 6 9 17 4 12" /></svg>}
        </div>
        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1a2e1f", fontFamily: "'Quicksand',sans-serif", lineHeight: 1.5 }}>{label}</span>
      </label>
      {error && <span style={{ fontSize: "0.72rem", color: "#e05c5c", fontFamily: "'Quicksand',sans-serif", fontWeight: 600, marginLeft: 28 }}>{error}</span>}
    </div>
  );
}

function TagPicker({ label, options, value, onChange, error, required: req }: {
  label?: string; options: string[]; value: string[]; onChange: (v: string[]) => void; error?: string; required?: boolean;
}) {
  const toggle = (t: string) => onChange(value.includes(t) ? value.filter(x => x !== t) : [...value, t]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {label && (
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2a5c38", fontFamily: "'Quicksand',sans-serif" }}>
          {label}{req && <span style={{ color: "#B8D52E", marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {options.map(t => {
          const active = value.includes(t);
          return (
            <button key={t} type="button" onClick={() => toggle(t)} style={{
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
      {error && <span style={{ fontSize: "0.72rem", color: "#e05c5c", fontFamily: "'Quicksand',sans-serif", fontWeight: 600 }}>{error}</span>}
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: "#eef7f1" }} />
      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ab8a5", fontFamily: "'Quicksand',sans-serif", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#eef7f1" }} />
    </div>
  );
}

function KycStepIndicator({ current, labels }: { current: number; labels: string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {labels.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < labels.length - 1 ? 1 : 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: i < current ? "#1a4d2e" : i === current ? "#1a4d2e" : "#f0f7f2",
              border: i === current ? "2px solid #B8D52E" : i < current ? "2px solid #1a4d2e" : "2px solid #c6e2d0",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s",
            }}>
              {i < current ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><polyline points="20 6 9 17 4 12" /></svg>
              ) : (
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: i === current ? "#B8D52E" : "#9ab8a5", fontFamily: "'Quicksand',sans-serif" }}>{i + 1}</span>
              )}
            </div>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: i === current ? "#1a4d2e" : i < current ? "#3d6b4d" : "#9ab8a5", fontFamily: "'Quicksand',sans-serif", whiteSpace: "nowrap" }}>
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < current ? "#1a4d2e" : "#e8f2eb", marginBottom: 18, marginLeft: 4, marginRight: 4, transition: "background 0.3s" }} />
          )}
        </div>
      ))}
    </div>
  );
}

function OperatorBusinessStep({ data, setData, errors }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Input label="Company / Organisation Name" placeholder="GreenHaul Services Ltd." required value={data.companyName ?? ""} onChange={(e: any) => setData({ ...data, companyName: e.target.value })} error={errors.companyName} />
      <Input label="Phone Number" type="tel" placeholder="+44 7700 900000" required value={data.phone ?? ""} onChange={(e: any) => setData({ ...data, phone: e.target.value })} error={errors.phone}
        leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.93-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.92 16.92z" /></svg>}
      />
      <Input label="Companies House Registration Number" placeholder="12345678" required value={data.regNumber ?? ""} onChange={(e: any) => setData({ ...data, regNumber: e.target.value })} error={errors.regNumber} hint="8-digit number from Companies House" />
      <Input label="VAT Number" placeholder="GB 123 4567 89" value={data.vatNumber ?? ""} onChange={(e: any) => setData({ ...data, vatNumber: e.target.value })} hint="Optional" />
      <Input label="Years in Operation" type="number" placeholder="e.g. 5" required value={data.yearsOp ?? ""} onChange={(e: any) => setData({ ...data, yearsOp: e.target.value })} error={errors.yearsOp} />
      <Textarea label="Service Area(s) / Postcodes Covered" placeholder="e.g. EC1, EC2, WC1, N1 — or describe your region" required value={data.serviceArea ?? ""} onChange={(e: any) => setData({ ...data, serviceArea: e.target.value })} error={errors.serviceArea} hint="List postcodes, districts, or regions you cover" />
      <TagPicker
        label="Types of Waste Handled"
        required
        options={["Recycling", "Reuse / Repurpose", "Landfill", "Inert Waste", "Hazardous / Specialist", "Skip Hire", "Bulk Clearance"]}
        value={data.wasteHandled ?? []}
        onChange={v => setData({ ...data, wasteHandled: v })}
        error={errors.wasteHandled}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Number of Vehicles" type="number" placeholder="e.g. 6" value={data.vehicles ?? ""} onChange={(e: any) => setData({ ...data, vehicles: e.target.value })} hint="Optional" />
        <Input label="Tonnage Capacity" placeholder="e.g. 20t/day" value={data.tonnage ?? ""} onChange={(e: any) => setData({ ...data, tonnage: e.target.value })} hint="Optional" />
      </div>
    </div>
  );
}

function OperatorComplianceStep({ data, setData, errors }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#fffbe6", border: "1px solid #f0d97a", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        <p style={{ fontSize: "0.76rem", color: "#7a5c00", fontFamily: "'Quicksand',sans-serif", fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
          A valid <strong>EA Waste Carrier Licence</strong> is a legal requirement in the UK. Your application cannot be approved without one.
        </p>
      </div>

      <FileUpload
        label="EA Waste Carrier Licence"
        required
        hint="Upload PDF, JPG, or PNG — must be current and valid"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={f => setData({ ...data, wasteCarrierDoc: f })}
        uploadedName={data.wasteCarrierDoc?.name ?? null}
      />
      {errors.wasteCarrierDoc && <span style={{ fontSize: "0.72rem", color: "#e05c5c", fontFamily: "'Quicksand',sans-serif", fontWeight: 600 }}>{errors.wasteCarrierDoc}</span>}

      <Input label="Waste Carrier Licence Number" placeholder="CBDU123456" required value={data.wasteCarrierNum ?? ""} onChange={(e: any) => setData({ ...data, wasteCarrierNum: e.target.value })} error={errors.wasteCarrierNum} hint="Found on your Environment Agency registration" />
      <Textarea label="Certifications & Other Licences" placeholder="e.g. ISO 14001, Hazardous Waste Consignee, SSAIB..." value={data.certs ?? ""} onChange={(e: any) => setData({ ...data, certs: e.target.value })} hint="Optional — list any additional relevant certifications" />

      <SectionDivider label="Insurance" />

      <Input label="Public Liability Insurance Provider" placeholder="e.g. Hiscox, AXA, Aviva" required value={data.insuranceProvider ?? ""} onChange={(e: any) => setData({ ...data, insuranceProvider: e.target.value })} error={errors.insuranceProvider} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Policy Number" placeholder="PLI-XXXXXXX" required value={data.policyNumber ?? ""} onChange={(e: any) => setData({ ...data, policyNumber: e.target.value })} error={errors.policyNumber} />
        <Input label="Coverage Amount" placeholder="e.g. £5,000,000" required value={data.coverage ?? ""} onChange={(e: any) => setData({ ...data, coverage: e.target.value })} error={errors.coverage} />
      </div>

      <SectionDivider label="Agreement" />

      <Checkbox
        checked={data.terms ?? false}
        onChange={v => setData({ ...data, terms: v })}
        error={errors.terms}
        label={<>I agree to the <a href="#" style={{ color: "#1a4d2e" }}>Platform Terms</a>, <a href="#" style={{ color: "#1a4d2e" }}>Operator Code of Conduct</a>, and <a href="#" style={{ color: "#1a4d2e" }}>Privacy Policy</a></>}
      />
    </div>
  );
}

function ContractorBusinessStep({ data, setData, errors }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Input label="Company / Organisation Name" placeholder="Buildright Ltd." required value={data.companyName ?? ""} onChange={(e: any) => setData({ ...data, companyName: e.target.value })} error={errors.companyName} />
      <Input label="Phone Number" type="tel" placeholder="+44 7700 900000" required value={data.phone ?? ""} onChange={(e: any) => setData({ ...data, phone: e.target.value })} error={errors.phone}
        leftIcon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.93-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.92 16.92z" /></svg>}
      />
      <Input label="Companies House Registration Number" placeholder="12345678" required value={data.regNumber ?? ""} onChange={(e: any) => setData({ ...data, regNumber: e.target.value })} error={errors.regNumber} hint="8-digit number from Companies House" />
      <Select label="Industry / Sector" required value={data.industry ?? ""} onChange={(e: any) => setData({ ...data, industry: e.target.value })} error={errors.industry}>
        <option value="">Select industry…</option>
        <option value="construction">Construction</option>
        <option value="demolition">Demolition</option>
        <option value="renovation">Renovation & Refurbishment</option>
        <option value="civil">Civil Engineering</option>
        <option value="housebuilding">Housebuilding</option>
        <option value="other">Other</option>
      </Select>
      <Input label="VAT Number" placeholder="GB 123 4567 89" value={data.vatNumber ?? ""} onChange={(e: any) => setData({ ...data, vatNumber: e.target.value })} hint="Optional — common for UK B2B billing" />

      <SectionDivider label="Site / Location" />

      <Input label="Site Address" placeholder="123 Construction Way" required value={data.siteAddress ?? ""} onChange={(e: any) => setData({ ...data, siteAddress: e.target.value })} error={errors.siteAddress} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Postcode" placeholder="EC1A 1BB" required value={data.postcode ?? ""} onChange={(e: any) => setData({ ...data, postcode: e.target.value })} error={errors.postcode} />
        <Input label="City / Region" placeholder="London" required value={data.city ?? ""} onChange={(e: any) => setData({ ...data, city: e.target.value })} error={errors.city} />
      </div>
    </div>
  );
}

const WASTE_TYPES = ["Concrete & Masonry", "Timber & Wood", "Metals & Steel", "Plasterboard", "Plastics", "Glass", "Mixed Construction", "Hazardous / Specialist"];

function ContractorWasteStep({ data, setData, errors }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TagPicker
        label="Types of Waste / Debris Generated"
        required
        options={WASTE_TYPES}
        value={data.wasteTypes ?? []}
        onChange={v => setData({ ...data, wasteTypes: v })}
        error={errors.wasteTypes}
      />
      <Select label="Estimated Disposal Frequency" required value={data.frequency ?? ""} onChange={(e: any) => setData({ ...data, frequency: e.target.value })} error={errors.frequency}>
        <option value="">Select frequency…</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="fortnightly">Fortnightly</option>
        <option value="monthly">Monthly</option>
        <option value="adhoc">Ad hoc / One-off</option>
      </Select>
      <Input label="Estimated Volume per Collection" placeholder="e.g. 8 cubic yards, 2 skips" value={data.volume ?? ""} onChange={(e: any) => setData({ ...data, volume: e.target.value })} hint="Approximate size helps us match you with the right operator" />

      <SectionDivider label="Business Verification" />

      <FileUpload
        label="Proof of Business"
        hint="Upload Companies House certificate or equivalent (PDF, JPG, PNG)"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={f => setData({ ...data, businessDoc: f })}
        uploadedName={data.businessDoc?.name ?? null}
      />

      <SectionDivider label="Agreement" />

      <Checkbox
        checked={data.terms ?? false}
        onChange={v => setData({ ...data, terms: v })}
        error={errors.terms}
        label={<>I agree to the <a href="#" style={{ color: "#1a4d2e" }}>Terms & Conditions</a> and <a href="#" style={{ color: "#1a4d2e" }}>Privacy Policy</a></>}
      />
    </div>
  );
}

export default function KycPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.replace("/login");
      return;
    }

    if (profile) {
      if (profile.kycStatus === "pending" || profile.kycStatus === "submitted" || profile.kycStatus === "approved") {
        router.replace(profile.role === "operator" ? "/operators/" : "/contractor/");
      }
    }
  }, [user, profile, authLoading, router]);

  if (authLoading || !profile) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5faf6" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#1a4d2e" strokeWidth="2.5" style={{ width: 28, height: 28, animation: "wfSpin 0.8s linear infinite" }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <style>{`@keyframes wfSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const role = profile.role as Role;
  const isOperator = role === "operator";

  const operatorStepLabels = ["Business Info", "Compliance"];
  const contractorStepLabels = ["Business & Site", "Waste Profile"];
  const stepLabels = isOperator ? operatorStepLabels : contractorStepLabels;

  const validateStep = () => {
    const errs: Record<string, string> = {};
    if (isOperator) {
      if (step === 0) {
        if (!data.companyName) errs.companyName = "Company name is required";
        if (!data.phone) errs.phone = "Phone number is required";
        if (!data.regNumber) errs.regNumber = "Registration number is required";
        if (!data.yearsOp) errs.yearsOp = "Years in operation is required";
        if (!data.serviceArea) errs.serviceArea = "Service area is required";
        if (!data.wasteHandled?.length) errs.wasteHandled = "Select at least one type";
      }
      if (step === 1) {
        if (!data.wasteCarrierDoc) errs.wasteCarrierDoc = "Please upload your EA Waste Carrier Licence";
        if (!data.wasteCarrierNum) errs.wasteCarrierNum = "Licence number is required";
        if (!data.insuranceProvider) errs.insuranceProvider = "Insurance provider is required";
        if (!data.policyNumber) errs.policyNumber = "Policy number is required";
        if (!data.coverage) errs.coverage = "Coverage amount is required";
        if (!data.terms) errs.terms = "You must agree to the terms to continue";
      }
    } else {
      if (step === 0) {
        if (!data.companyName) errs.companyName = "Company name is required";
        if (!data.phone) errs.phone = "Phone number is required";
        if (!data.regNumber) errs.regNumber = "Registration number is required";
        if (!data.industry) errs.industry = "Please select your industry";
        if (!data.siteAddress) errs.siteAddress = "Site address is required";
        if (!data.postcode) errs.postcode = "Postcode is required";
        if (!data.city) errs.city = "City is required";
      }
      if (step === 1) {
        if (!data.wasteTypes?.length) errs.wasteTypes = "Select at least one waste type";
        if (!data.frequency) errs.frequency = "Please select disposal frequency";
        if (!data.terms) errs.terms = "You must agree to the terms to continue";
      }
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => { setErrors({}); setStep(0); window.scrollTo(0, 0); };

  const handleSubmit = async () => {
    const errs = validateStep();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    try {
      const kycData: Record<string, any> = { ...data };
      const uid = user!.uid;

      if (isOperator && data.wasteCarrierDoc instanceof File) {
        kycData.wasteCarrierDocUrl = await uploadToCloudinary(
          data.wasteCarrierDoc,
          `wasteflow/kyc/${uid}`,
          (pct) => setUploadProgress(`Uploading EA Waste Carrier Licence… ${pct}%`)
        );
        delete kycData.wasteCarrierDoc;
      }

      if (!isOperator && data.businessDoc instanceof File) {
        kycData.businessDocUrl = await uploadToCloudinary(
          data.businessDoc,
          `wasteflow/kyc/${uid}`,
          (pct) => setUploadProgress(`Uploading proof of business… ${pct}%`)
        );
        delete kycData.businessDoc;
      }

      setUploadProgress("Saving your details…");
      await updateUserKYC(uid, { 
        ...kycData, 
        kycStatus: "pending",
        kycSubmittedAt: new Date().toISOString()
      });

      setSubmitting(false);
      setUploadProgress("");

      router.replace(isOperator ? "/operators/" : "/contractor/");

    } catch (err) {
      console.error(err);
      setSubmitting(false);
      setUploadProgress("");
      setErrors({ _global: "Something went wrong. Please try again." });
    }
  };

  const headings = {
    operator: ["Business information", "Compliance & verification"],
    contractor: ["Business & site details", "Waste profile & verification"],
  };
  const subs = {
    operator: ["Tell us about your waste collection business.", "Licences, insurance, and legal compliance."],
    contractor: ["Tell us about your company and construction site.", "What waste you generate and business verification."],
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        @keyframes wfSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes wfFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .kyc-root { min-height: 100vh; display: flex; flex-direction: column; background: #f5faf6; font-family: 'Quicksand', sans-serif; }

        .kyc-topbar { background: #fff; border-bottom: 1px solid #eef7f1; padding: 0 32px; height: 60px; display: flex; align-items: center; justify-content: flex-end; flex-shrink: 0; position: sticky; top: 0; z-index: 20; }

        .kyc-body { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 40px 20px 60px; }
        .kyc-card { width: 100%; max-width: 560px; background: #fff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; animation: wfFadeUp 0.4s ease both; }

        .kyc-card-header { padding: 28px 32px 0; }
        .kyc-card-body { padding: 20px 32px 32px; }

        .kyc-submit-btn { width: 100%; padding: 14px; border-radius: 10px; background: #1a4d2e; color: #e8f5ee; font-size: 0.92rem; font-weight: 700; font-family: 'Quicksand', sans-serif; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.18s; box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
        .kyc-submit-btn:hover:not(:disabled) { background: #0f2d1a; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(26,77,46,0.25); }
        .kyc-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .kyc-next-btn { width: 100%; padding: 14px; border-radius: 10px; background: #1a4d2e; color: #e8f5ee; font-size: 0.92rem; font-weight: 700; font-family: 'Quicksand', sans-serif; border: none; cursor: pointer; transition: all 0.18s; }
        .kyc-next-btn:hover { background: #0f2d1a; transform: translateY(-1px); }

        .kyc-back-btn { background: none; border: 1.5px solid #c6e2d0; border-radius: 10px; padding: 13px 18px; font-size: 0.88rem; font-weight: 700; font-family: 'Quicksand', sans-serif; color: #3d6b4d; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.18s; }
        .kyc-back-btn:hover { border-color: #1a4d2e; background: #f5faf6; }

        .kyc-role-badge { display: inline-flex; align-items: center; gap: 6px; padding: "5px 10px"; border-radius: 20px; background: #f0f7f2; border: 1px solid #c6e2d0; font-size: 0.72rem; font-weight: 700; color: #3d6b4d; font-family: 'Quicksand', sans-serif; }

        .kyc-progress { display: flex; align-items: center; gap: 6px; }
        .kyc-progress-dot { width: 6px; height: 6px; border-radius: 50%; background: #c6e2d0; }
        .kyc-progress-dot.done { background: #B8D52E; }
        .kyc-progress-dot.active { width: 20px; border-radius: 3px; background: #1a4d2e; }
      `}</style>

      <div className="kyc-root">
        <div className="kyc-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="kyc-progress">
              <div className="kyc-progress-dot done" />
              <div className="kyc-progress-dot done" />
              <div className="kyc-progress-dot active" />
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ab8a5", fontFamily: "'Quicksand',sans-serif" }}>Step 3 of 3</span>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: "#f0f7f2", border: "1px solid #c6e2d0" }}>
              <span style={{ fontSize: "0.78rem" }}>{isOperator ? "🏗" : "🚛"}</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#3d6b4d", fontFamily: "'Quicksand',sans-serif" }}>
                {isOperator ? "Operator" : "Contractor"}
              </span>
            </div>
          </div>
        </div>

        <div className="kyc-body">
          <div className="kyc-card" key={step}>
            <div className="kyc-card-header">
              <div style={{ background: "linear-gradient(135deg, #f0f7f2 0%, #e8f5ee 100%)", border: "1px solid #c6e2d0", borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1a4d2e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1a2e1f", fontFamily: "'Quicksand',sans-serif", margin: 0 }}>
                    Complete your KYC
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "#3d6b4d", fontWeight: 600, fontFamily: "'Quicksand',sans-serif", margin: 0 }}>
                    Signed in as {profile.fullName || user?.email}
                  </p>
                </div>
              </div>

              <KycStepIndicator current={step} labels={stepLabels} />

              <h1 style={{ fontSize: "1.45rem", fontWeight: 700, color: "#1a2e1f", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 4, fontFamily: "'Quicksand',sans-serif" }}>
                {headings[role][step]}
              </h1>
              <p style={{ fontSize: "0.875rem", color: "#6b8f7a", fontWeight: 600, marginBottom: 20, lineHeight: 1.55, fontFamily: "'Quicksand',sans-serif" }}>
                {subs[role][step]}
              </p>
            </div>

            <div className="kyc-card-body">
              {errors._global && (
                <div style={{ background: "#fff5f5", border: "1px solid #f5c6c6", borderRadius: 10, padding: "11px 14px", marginBottom: 16, display: "flex", gap: 9 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <p style={{ fontSize: "0.78rem", color: "#c0392b", fontWeight: 600, fontFamily: "'Quicksand',sans-serif", margin: 0 }}>{errors._global}</p>
                </div>
              )}

              {isOperator && step === 0 && <OperatorBusinessStep data={data} setData={setData} errors={errors} />}
              {isOperator && step === 1 && <OperatorComplianceStep data={data} setData={setData} errors={errors} />}
              {!isOperator && step === 0 && <ContractorBusinessStep data={data} setData={setData} errors={errors} />}
              {!isOperator && step === 1 && <ContractorWasteStep data={data} setData={setData} errors={errors} />}

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f0f7f2" }}>
                {step === 0 ? (
                  <button type="button" className="kyc-next-btn" onClick={handleNext}>
                    Continue
                  </button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {uploadProgress && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0f7f2", borderRadius: 8 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#1a4d2e" strokeWidth="2.5" style={{ width: 14, height: 14, animation: "wfSpin 0.8s linear infinite", flexShrink: 0 }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1a4d2e", fontFamily: "'Quicksand',sans-serif" }}>{uploadProgress}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="kyc-submit-btn"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14, animation: "wfSpin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Submitting KYC…</>
                      ) : (
                        <>Submit KYC & access dashboard</>
                      )}
                    </button>
                    <button type="button" className="kyc-back-btn" onClick={handleBack} disabled={submitting}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                      Back to business details
                    </button>
                  </div>
                )}
              </div>

              <p style={{ textAlign: "center", marginTop: 14, fontSize: "0.72rem", fontWeight: 600, color: "#9ab8a5", fontFamily: "'Quicksand',sans-serif", lineHeight: 1.5 }}>
                Your progress is automatically saved. You can return to complete this later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
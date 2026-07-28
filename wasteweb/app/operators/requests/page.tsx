"use client";

import { useState, useEffect, useRef } from "react";
import {
  collection, query, where, orderBy, onSnapshot, doc, updateDoc, getDoc, serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import { useLiveLocationBroadcaster } from "../../hooks/useLiveLocationBroadcaster";
import LiveTrackingMap from "../../components/LiveTrackingMap";
import { logAdminEvent } from "../../lib/adminLog";
import { downloadCompletedRequestReport } from "../../lib/generateRequestReportPdf";
import { COMMON_EWC_CODES, PHYSICAL_FORMS, WEIGHT_UNITS, COMMON_DISPOSAL_RECOVERY_CODES, WasteTransferRecord } from "../../lib/wasteTransferReference";

const TABS = ["All", "Pending", "Accepted", "Scheduled", "Arriving", "In Transit", "Completed", "Declined", "Rescheduled"];

const STATUS_CONFIG = {
  Pending:      { bg: "rgba(251,191,36,0.12)",  color: "#b45309", border: "rgba(251,191,36,0.35)",  dot: "#f59e0b" },
  Accepted:     { bg: "rgba(34,197,94,0.10)",   color: "#15803d", border: "rgba(34,197,94,0.3)",    dot: "#22c55e" },
  Scheduled:    { bg: "rgba(59,130,246,0.10)",  color: "#1d4ed8", border: "rgba(59,130,246,0.3)",   dot: "#3b82f6" },
  Arriving:     { bg: "rgba(34,211,238,0.10)",  color: "#0e7490", border: "rgba(34,211,238,0.3)",   dot: "#06b6d4" },
  "In Transit": { bg: "rgba(168,85,247,0.10)",  color: "#7c3aed", border: "rgba(168,85,247,0.3)",   dot: "#a855f7" },
  Completed:    { bg: "rgba(184,213,46,0.12)",  color: "#3a6b00", border: "rgba(184,213,46,0.35)",  dot: "#B8D52E" },
  Declined:     { bg: "rgba(239,68,68,0.10)",   color: "#b91c1c", border: "rgba(239,68,68,0.25)",   dot: "#ef4444" },
  Rescheduled:  { bg: "rgba(139,92,246,0.12)",  color: "#7c3aed", border: "rgba(139,92,246,0.35)",  dot: "#8b5cf6" },
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
  pending:             "Pending",
  confirmed:           "Accepted",
  scheduled:           "Scheduled",
  arriving:            "Arriving",
  in_transit:          "In Transit",
  completed:           "Completed",
  declined:            "Declined",
  cancelled:           "Declined",
  awaiting_reschedule: "Rescheduled",
};

const STATUS_WRITE: Record<string, string> = {
  Pending:      "pending",
  Accepted:     "confirmed",
  Scheduled:    "scheduled",
  Arriving:     "arriving",
  "In Transit": "in_transit",
  Completed:    "completed",
  Declined:     "declined",
  Rescheduled:  "awaiting_reschedule",
};

// Which Firestore field records the moment each stage was reached, so the
// contractor's request timeline can show a real date/time per step.
const STATUS_TIMESTAMP_FIELD: Record<string, string> = {
  scheduled:  "scheduledAt",
  arriving:   "arrivingAt",
  in_transit: "inTransitAt",
  declined:   "declinedAt",
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

async function uploadToCloudinary(file: Blob, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file, filename);
  formData.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudinary upload failed: ${errText}`);
  }
  const data = await res.json();
  return data.secure_url as string;
}

export type FirestoreRequest = {
  id: string;
  title: string;
  wasteType: string;
  status: string;
  location: string;
  windowStart?: string;
  windowEnd?: string;
  availability?: string;
  volume?: string;
  notes?: string;
  contractorId: string;
  operatorId?: string;
  contractorName?: string;
  operatorName?: string;
  driverName?: string;
  wasteTransferRecord?: WasteTransferRecord | null;
  proofPhotoUrl?: string;
  signatureUrl?: string;
  declineReason?: string;
  rescheduleRequest?: {
    date: string;
    fromTime: string;
    toTime: string;
    note: string;
    requestedAt?: any;
  };
  destinationLat?: number;
  destinationLng?: number;
  liveLocation?: {
    lat: number;
    lng: number;
    heading: number | null;
    speed: number | null;
    updatedAt: any;
  } | null;
  createdAt?: any;
  scheduledAt?: any;
  arrivingAt?: any;
  inTransitAt?: any;
  completedAt?: any;
  declinedAt?: any;
};

export type RequestItem = {
  id: string;
  title: string;
  wasteType: string;
  status: string;
  rawStatus: string;
  location: string;
  dates: string;
  availability?: string;
  yards: string;
  note: string;
  contractorName?: string;
  contractorId?: string;
  operatorId?: string;
  operatorName?: string;
  driverName?: string;
  proofPhotoUrl?: string;
  signatureUrl?: string;
  declineReason?: string;
  wasteTransferRecord?: WasteTransferRecord | null;
  createdAt?: string | null;
  scheduledAt?: string | null;
  arrivingAt?: string | null;
  inTransitAt?: string | null;
  completedAt?: string | null;
  declinedAt?: string | null;
  rescheduleRequest?: {
    date: string;
    fromTime: string;
    toTime: string;
    note: string;
    requestedAt?: any;
  };
  destinationLat?: number;
  destinationLng?: number;
  liveLocation?: {
    lat: number;
    lng: number;
    heading: number | null;
    speed: number | null;
    updatedAt: any;
  };
};

function formatDateRange(start?: string, end?: string, availability?: string) {
  if (!start) return "—";
  let startTime = "";
  let endTime = "";
  if (availability) {
    const parts = availability.split("-").map((p) => p.trim());
    startTime = parts[0] || "";
    endTime   = parts[1] || parts[0] || "";
  }
  const fmt = (iso: string, time: string) => {
    const datePart = new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return time ? `${datePart}, ${time}` : datePart;
  };
  if (!end || end === start) {
    if (startTime && endTime && startTime !== endTime) return `${fmt(start, startTime)} – ${endTime}`;
    return fmt(start, startTime);
  }
  return `${fmt(start, startTime)} – ${fmt(end, endTime)}`;
}

// Renders every recorded stage timestamp so the operator's completed-request
// view and the generated PDF report show a full, real date/time per step.
function formatTimestamp(ts: any): string | null {
  if (!ts) return null;

  let date: Date;
  if (typeof ts?.toDate === "function") {
    date = ts.toDate();
  } else if (typeof ts === "object" && typeof ts.seconds === "number") {
    date = new Date(ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6));
  } else {
    date = new Date(ts);
  }

  if (isNaN(date.getTime())) return null;
  return (
    date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
    " · " +
    date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

function mapDoc(d: FirestoreRequest): RequestItem {
  return {
    id: d.id,
    title: d.title,
    wasteType: d.wasteType,
    status: STATUS_DISPLAY[d.status] ?? "Pending",
    rawStatus: d.status,
    location: d.location,
    dates: formatDateRange(d.windowStart, d.windowEnd, d.availability),
    availability: d.availability,
    yards: d.volume || "—",
    note: d.notes || "",
    contractorName: d.contractorName,
    contractorId: d.contractorId,
    operatorId: d.operatorId,
    operatorName: d.operatorName,
    driverName: d.driverName,
    wasteTransferRecord: d.wasteTransferRecord,
    proofPhotoUrl: d.proofPhotoUrl,
    signatureUrl: d.signatureUrl,
    createdAt: formatTimestamp(d.createdAt),
    scheduledAt: formatTimestamp(d.scheduledAt),
    arrivingAt: formatTimestamp(d.arrivingAt),
    inTransitAt: formatTimestamp(d.inTransitAt),
    completedAt: formatTimestamp(d.completedAt),
    declinedAt: formatTimestamp(d.declinedAt),
    declineReason: d.declineReason,
    rescheduleRequest: d.rescheduleRequest || undefined,
    destinationLat: typeof d.destinationLat === "number" ? d.destinationLat : undefined,
    destinationLng: typeof d.destinationLng === "number" ? d.destinationLng : undefined,
    liveLocation: d.liveLocation || undefined,
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
  const isRescheduled = req.status === "Rescheduled";

  return (
    <div className="wf-card" style={{
      background: "#ffffff",
      border: isRescheduled ? "1.5px solid rgba(139,92,246,0.35)" : "1px solid #e8f2eb",
      borderRadius: 16,
      padding: "20px",
      display: "flex", flexDirection: "column", gap: 14,
      boxShadow: isRescheduled
        ? "0 0 0 3px rgba(139,92,246,0.07), 0 1px 6px rgba(0,0,0,0.05)"
        : "0 1px 6px rgba(0,0,0,0.05)",
      transition: "box-shadow 0.2s, transform 0.2s",
      fontFamily: "'Quicksand', sans-serif",
      position: "relative",
    }}>
      {isRescheduled && (
        <div style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: 999, padding: "3px 9px",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#8b5cf6",
            boxShadow: "0 0 0 2px rgba(139,92,246,0.3)",
          }} />
          <span style={{
            fontSize: "0.62rem", fontWeight: 700,
            color: "#7c3aed", fontFamily: "'Quicksand', sans-serif",
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            Reschedule requested
          </span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8,
          paddingRight: isRescheduled ? 148 : 0,
        }}>
          <h3 style={{
            fontSize: "1rem", fontWeight: 700,
            color: "#1a2e1f", margin: 0,
            fontFamily: "'Quicksand', sans-serif",
            lineHeight: 1.3,
          }}>{req.title}</h3>
          {!isRescheduled && (
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, color: "#9ab8a5",
              fontFamily: "'Quicksand', sans-serif",
              whiteSpace: "nowrap", letterSpacing: "0.04em",
            }}>{req.id.slice(0, 8).toUpperCase()}</span>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <WasteTypeBadge type={req.wasteType} />
          <StatusBadge status={req.status} />
        </div>
      </div>

      <div style={{ height: 1, background: "#f0f7f2" }} />

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
            <circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.5 8Z"/>
          </svg>
        } text={req.yards} />
        {req.contractorName && (
          <MetaRow icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          } text={`Contractor: ${req.contractorName}`} />
        )}
        {isRescheduled && req.rescheduleRequest && (
          <MetaRow icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.08-4.82"/>
            </svg>
          } text={`Proposed: ${req.rescheduleRequest.date}, ${req.rescheduleRequest.fromTime} – ${req.rescheduleRequest.toTime}`} />
        )}
      </div>

      <button
        className="wf-btn-view"
        onClick={() => onViewDetails(req)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          padding: "11px 16px", borderRadius: 10, cursor: "pointer",
          background: isRescheduled ? "rgba(139,92,246,0.08)" : "#1a4d2e",
          border: isRescheduled ? "1px solid rgba(139,92,246,0.3)" : "none",
          color: isRescheduled ? "#7c3aed" : "#B8D52E",
          fontSize: "0.82rem", fontWeight: 700,
          fontFamily: "'Quicksand', sans-serif",
          transition: "background 0.18s",
          marginTop: "auto",
        }}
      >
        {isRescheduled ? "Review Reschedule" : "View Details"}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>
  );
}

function SignaturePad({ onChange }: { onChange: (hasSignature: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const hasDrawnRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1a2e1f";
  }, []);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !lastPointRef.current) return;
    const point = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
    if (!hasDrawnRef.current) { hasDrawnRef.current = true; onChange(true); }
  };

  const handlePointerUp = () => { drawingRef.current = false; lastPointRef.current = null; };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
    onChange(false);
  };

  (SignaturePad as any)._getCanvas = () => canvasRef.current;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ position: "relative", border: "1.5px dashed #c6e2d0", borderRadius: 10, background: "#fbfdfb", overflow: "hidden" }}>
        <canvas
          ref={canvasRef}
          data-signature-canvas
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ width: "100%", height: 140, display: "block", cursor: "crosshair", touchAction: "none" }}
        />
        {!hasDrawnRef.current && (
          <span style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.78rem", fontWeight: 600, color: "#9ab8a5",
            fontFamily: "'Quicksand', sans-serif", pointerEvents: "none",
          }}>Sign here</span>
        )}
      </div>
      <button type="button" onClick={clear} style={{
        alignSelf: "flex-end", background: "none", border: "none", cursor: "pointer",
        fontSize: "0.74rem", fontWeight: 700, color: "#8aab97",
        fontFamily: "'Quicksand', sans-serif", padding: "2px 4px",
      }}>Clear signature</button>
    </div>
  );
}

export type WasteTransferFormData = {
  ewcCode: string;
  wasteDescription: string;
  physicalForm: string;
  isHazardous: boolean;
  weightAmount: string;
  weightUnit: string;
  weightEstimated: boolean;
  disposalOrRecoveryCode: string;
  receivingSiteName: string;
  receivingSiteAddress: string;
  receivingSitePostcode: string;
  receivingSiteAuthNumber: string;
};

function CompleteForm({ loading, onCancel, onStep1Complete, onStep2Complete }: {
  loading: boolean;
  onCancel: () => void;
  // Saves immediately — the job is marked completed and the contractor can
  // already download a report from this point, even before DEFRA details
  // (step 2) are added.
  onStep1Complete: (data: { operatorName: string; photoFile: File; signatureBlob: Blob }) => Promise<void>;
  // Updates the already-completed request with the DEFRA waste transfer
  // record, so the contractor's report gets regenerated with those details.
  onStep2Complete: (data: { wasteSignatureBlob: Blob; wasteTransfer: WasteTransferFormData }) => Promise<void>;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [operatorName, setOperatorName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasWasteSignature, setHasWasteSignature] = useState(false);
  const [hasDEFRASignature, setHasDEFRASignature] = useState(false);
  const [stepSubmitting, setStepSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [ewcCode, setEwcCode] = useState("");
  const [wasteDescription, setWasteDescription] = useState("");
  const [physicalForm, setPhysicalForm] = useState(PHYSICAL_FORMS[0]);
  const [isHazardous, setIsHazardous] = useState(false);
  const [weightAmount, setWeightAmount] = useState("");
  const [weightUnit, setWeightUnit] = useState(WEIGHT_UNITS[0]);
  const [weightEstimated, setWeightEstimated] = useState(true);
  const [disposalOrRecoveryCode, setDisposalOrRecoveryCode] = useState(COMMON_DISPOSAL_RECOVERY_CODES[0].code);
  const [showReceivingSite, setShowReceivingSite] = useState(false);
  const [receivingSiteName, setReceivingSiteName] = useState("");
  const [receivingSiteAddress, setReceivingSiteAddress] = useState("");
  const [receivingSitePostcode, setReceivingSitePostcode] = useState("");
  const [receivingSiteAuthNumber, setReceivingSiteAuthNumber] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // Captures the CURRENTLY-mounted step-1 canvas and saves it right away —
  // the canvas unmounts once we move to step 2, so this is the only point
  // it can ever be read. Only advances to step 2 once the save actually
  // succeeds, so the job is genuinely marked completed (and downloadable by
  // the contractor) before any DEFRA details exist.
  const handleContinueToStep2 = () => {
    if (!operatorName.trim()) { setError("Enter the operator's name."); return; }
    if (!photoFile) { setError("Upload a photo before continuing."); return; }
    if (!hasWasteSignature) { setError("Add a signature for waste acceptance."); return; }
    const canvas: HTMLCanvasElement | null = (SignaturePad as any)._getCanvas?.();
    if (!canvas) { setError("Signature pad not ready — try again."); return; }
    setError(null);
    setStepSubmitting(true);
    canvas.toBlob(async (blob) => {
      if (!blob) { setError("Could not read signature — try signing again."); setStepSubmitting(false); return; }
      if (!photoFile) { setError("Photo is required."); setStepSubmitting(false); return; }
      try {
        await onStep1Complete({ operatorName: operatorName.trim(), photoFile, signatureBlob: blob });
        setStep(2);
      } catch (err: any) {
        setError(`Could not save: ${err?.message || "please try again."}`);
      } finally {
        setStepSubmitting(false);
      }
    }, "image/png");
  };

  const handleSubmit = () => {
    if (!ewcCode.trim()) { setError("Select or enter an EWC waste code."); return; }
    if (!weightAmount.trim() || Number.isNaN(Number(weightAmount))) { setError("Enter the waste weight."); return; }
    if (!hasDEFRASignature) { setError("Add a signature for the waste transfer."); return; }
    const wasteCanvas: HTMLCanvasElement | null = (SignaturePad as any)._getCanvas?.();
    if (!wasteCanvas) { setError("Signature pad not ready — try again."); return; }
    setError(null);
    setStepSubmitting(true);
    wasteCanvas.toBlob(async (wasteBlob) => {
      if (!wasteBlob) { setError("Could not read signature — try signing again."); setStepSubmitting(false); return; }
      try {
        await onStep2Complete({
          wasteSignatureBlob: wasteBlob,
          wasteTransfer: {
            ewcCode: ewcCode.trim(),
            wasteDescription: wasteDescription.trim(),
            physicalForm,
            isHazardous,
            weightAmount: weightAmount.trim(),
            weightUnit,
            weightEstimated,
            disposalOrRecoveryCode,
            receivingSiteName: receivingSiteName.trim(),
            receivingSiteAddress: receivingSiteAddress.trim(),
            receivingSitePostcode: receivingSitePostcode.trim(),
            receivingSiteAuthNumber: receivingSiteAuthNumber.trim(),
          },
        });
      } catch (err: any) {
        setError(`Could not save DEFRA details: ${err?.message || "please try again."}`);
      } finally {
        setStepSubmitting(false);
      }
    }, "image/png");
  };

  if (step === 1) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>Complete this job (Step 1 of 2)</p>
          <p style={{ fontSize: "0.74rem", fontWeight: 600, color: "#8aab97", margin: "2px 0 0" }}>Add the operator's name, a site photo, and signature. The contractor can download a report as soon as this is saved — the job itself is only marked Completed once DEFRA details are added in step 2.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a" }}>Site Manager</label>
          <input type="text" value={operatorName} onChange={(e) => setOperatorName(e.target.value)} placeholder="e.g. John"
            style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #e8f2eb", fontSize: "0.84rem", fontWeight: 600, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", outline: "none" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a" }}>Site photo</label>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ display: "none" }} />
          {photoPreview ? (
            <div style={{ position: "relative", borderRadius: 10, overflow: "hidden" }}>
              <img src={photoPreview} alt="Selected proof" style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(26,46,31,0.75)", color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Quicksand', sans-serif" }}>Change photo</button>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, height: 100, borderRadius: 10, border: "1.5px dashed #c6e2d0", background: "#fbfdfb", color: "#6b8f7a", cursor: "pointer", fontFamily: "'Quicksand', sans-serif" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
              <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>Tap to add a photo</span>
            </button>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a" }}>Signature (Waste Acceptance)</label>
          <SignaturePad onChange={setHasWasteSignature} />
        </div>
        {error && <p style={{ fontSize: "0.76rem", fontWeight: 700, color: "#b91c1c", margin: 0 }}>{error}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button type="button" onClick={onCancel} disabled={loading || stepSubmitting} style={{ flex: 1, padding: "11px 16px", borderRadius: 10, border: "1px solid #e8f2eb", background: "none", color: "#6b8f7a", fontSize: "0.82rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif", cursor: (loading || stepSubmitting) ? "not-allowed" : "pointer" }}>Back</button>
          <button type="button" onClick={handleContinueToStep2} disabled={loading || stepSubmitting} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 16px", borderRadius: 10, border: "none", background: "#1a4d2e", color: "#B8D52E", fontSize: "0.82rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif", cursor: (loading || stepSubmitting) ? "not-allowed" : "pointer", opacity: (loading || stepSubmitting) ? 0.7 : 1 }}>
            {stepSubmitting ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14, animation: "wfSpin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            ) : null}
            {stepSubmitting ? "Saving…" : "Save & Continue to DEFRA Details"}
            {!stepSubmitting && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>Waste Transfer Details (Step 2 of 2)</p>
        <p style={{ fontSize: "0.74rem", fontWeight: 600, color: "#8aab97", margin: "2px 0 0" }}>Add waste transfer information for the completed job.</p>
      </div>
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 8,
        background: "rgba(184,213,46,0.12)", border: "1px solid rgba(184,213,46,0.3)",
        borderRadius: 8, padding: "8px 10px",
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#3a6b00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12"/></svg>
        <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#3a6b00", margin: 0, lineHeight: 1.5 }}>
          Photo and signature saved — the contractor can already download a report. Add these DEFRA details below to mark the job Completed and include them in that report, or close this and add them later.
        </p>
      </div>
      <div style={{ borderTop: "1px solid #f0f7f2", paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>Waste Transfer Details</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a" }}>EWC waste code</label>
          <select value={ewcCode} onChange={(e) => setEwcCode(e.target.value)}
            style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #e8f2eb", fontSize: "0.84rem", fontWeight: 600, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", outline: "none" }}>
            <option value="">Select a code…</option>
            {COMMON_EWC_CODES.map((c) => (
              <option key={c.code} value={c.code}>{c.code} — {c.description}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a" }}>Waste description (optional)</label>
          <input type="text" value={wasteDescription} onChange={(e) => setWasteDescription(e.target.value)} placeholder="e.g. Mixed rubble and packaging"
            style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #e8f2eb", fontSize: "0.84rem", fontWeight: 600, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a" }}>Physical form</label>
            <select value={physicalForm} onChange={(e) => setPhysicalForm(e.target.value)}
              style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #e8f2eb", fontSize: "0.84rem", fontWeight: 600, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", outline: "none" }}>
              {PHYSICAL_FORMS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a" }}>Weight</label>
            <input type="number" min="0" value={weightAmount} onChange={(e) => setWeightAmount(e.target.value)} placeholder="e.g. 2.5"
              style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #e8f2eb", fontSize: "0.84rem", fontWeight: 600, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", outline: "none" }} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a" }}>Unit</label>
            <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)}
              style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #e8f2eb", fontSize: "0.84rem", fontWeight: 600, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", outline: "none" }}>
              {WEIGHT_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", fontWeight: 600, color: "#4a7a5a", cursor: "pointer" }}>
          <input type="checkbox" checked={weightEstimated} onChange={(e) => setWeightEstimated(e.target.checked)} />
          Weight is estimated
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", fontWeight: 600, color: "#4a7a5a", cursor: "pointer" }}>
          <input type="checkbox" checked={isHazardous} onChange={(e) => setIsHazardous(e.target.checked)} />
          This waste is hazardous
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a" }}>Disposal / recovery code</label>
          <select value={disposalOrRecoveryCode} onChange={(e) => setDisposalOrRecoveryCode(e.target.value)}
            style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #e8f2eb", fontSize: "0.84rem", fontWeight: 600, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", outline: "none" }}>
            {COMMON_DISPOSAL_RECOVERY_CODES.map((c) => (
              <option key={c.code} value={c.code}>{c.code} — {c.description}</option>
            ))}
          </select>
        </div>

        <button type="button" onClick={() => setShowReceivingSite((v) => !v)} style={{ background: "none", border: "none", padding: 0, textAlign: "left", fontSize: "0.76rem", fontWeight: 700, color: "#1a4d2e", cursor: "pointer" }}>
          {showReceivingSite ? "Hide" : "Add"} receiving site details (optional)
        </button>
        {showReceivingSite && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input type="text" value={receivingSiteName} onChange={(e) => setReceivingSiteName(e.target.value)} placeholder="Receiving site name"
              style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #e8f2eb", fontSize: "0.84rem", fontWeight: 600, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", outline: "none" }} />
            <input type="text" value={receivingSiteAddress} onChange={(e) => setReceivingSiteAddress(e.target.value)} placeholder="Receiving site address"
              style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #e8f2eb", fontSize: "0.84rem", fontWeight: 600, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", outline: "none" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" value={receivingSitePostcode} onChange={(e) => setReceivingSitePostcode(e.target.value)} placeholder="Postcode"
                style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "1px solid #e8f2eb", fontSize: "0.84rem", fontWeight: 600, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", outline: "none" }} />
              <input type="text" value={receivingSiteAuthNumber} onChange={(e) => setReceivingSiteAuthNumber(e.target.value)} placeholder="Authorisation/permit number"
                style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "1px solid #e8f2eb", fontSize: "0.84rem", fontWeight: 600, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", outline: "none" }} />
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a" }}>Signature (DEFRA Waste Transfer Confirmation)</label>
        <SignaturePad onChange={setHasDEFRASignature} />
      </div>
      {error && <p style={{ fontSize: "0.76rem", fontWeight: 700, color: "#b91c1c", margin: 0 }}>{error}</p>}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button type="button" onClick={() => setStep(1)} disabled={loading || stepSubmitting} style={{ flex: 1, padding: "11px 16px", borderRadius: 10, border: "1px solid #e8f2eb", background: "none", color: "#6b8f7a", fontSize: "0.82rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif", cursor: (loading || stepSubmitting) ? "not-allowed" : "pointer" }}>Back to Step 1</button>
        <button type="button" onClick={handleSubmit} disabled={loading || stepSubmitting} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 16px", borderRadius: 10, border: "none", background: "#1a4d2e", color: "#B8D52E", fontSize: "0.82rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif", cursor: (loading || stepSubmitting) ? "not-allowed" : "pointer", opacity: (loading || stepSubmitting) ? 0.7 : 1 }}>
          {stepSubmitting ? (<><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14, animation: "wfSpin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Saving…</>) : "Save DEFRA Details"}
        </button>
      </div>
    </div>
  );
}

function DeclineReasonForm({ loading, onCancel, onSubmit }: {
  loading: boolean;
  onCancel: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!reason.trim()) { setError("Add a reason for declining this request."); return; }
    setError(null);
    onSubmit(reason.trim());
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>Decline this request</p>
        <p style={{ fontSize: "0.74rem", fontWeight: 600, color: "#8aab97", margin: "2px 0 0" }}>Let the contractor know why this pickup can't go ahead.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a" }}>Reason</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Outside our service area, or capacity unavailable this week" rows={4}
          style={{ padding: "10px 12px", borderRadius: 9, border: "1px solid #e8f2eb", fontSize: "0.84rem", fontWeight: 600, color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", outline: "none", resize: "vertical" }} />
      </div>
      {error && <p style={{ fontSize: "0.76rem", fontWeight: 700, color: "#b91c1c", margin: 0 }}>{error}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={onCancel} disabled={loading} style={{ flex: 1, padding: "11px 16px", borderRadius: 10, border: "1px solid #e8f2eb", background: "none", color: "#6b8f7a", fontSize: "0.82rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif", cursor: loading ? "not-allowed" : "pointer" }}>Back</button>
        <button type="button" onClick={handleSubmit} disabled={loading} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 16px", borderRadius: 10, border: "none", background: "#fef2f2", color: "#b91c1c", outline: "1.5px solid #b91c1c22", fontSize: "0.82rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? (<><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14, animation: "wfSpin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Declining…</>) : "Confirm Decline"}
        </button>
      </div>
    </div>
  );
}

const STATUS_FLOW: { label: string; value: string; color: string; bg: string; icon: React.ReactNode }[] = [
  {
    label: "Schedule", value: "Scheduled", color: "#1d4ed8", bg: "rgba(59,130,246,0.10)",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    label: "Move to In Transit", value: "In Transit", color: "#7c3aed", bg: "rgba(168,85,247,0.10)",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  },
  {
    label: "Mark Arriving", value: "Arriving", color: "#0e7490", bg: "rgba(34,211,238,0.10)",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
  },
  {
    label: "Complete", value: "Completed", color: "#3a6b00", bg: "rgba(184,213,46,0.12)",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="20 6 9 17 4 12"/></svg>,
  },
  {
    label: "Decline", value: "Declined", color: "#b91c1c", bg: "rgba(239,68,68,0.10)",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  },
];

// "Scheduled" (raw 'scheduled', awaiting the contractor's confirmation) can
// only be declined — the operator cannot mark Arriving until the contractor
// confirms and the request flips to "Accepted" (raw 'confirmed'). This is
// the two-way confirmation gate; it's also enforced server-side in
// firestore.rules so it can't be bypassed by calling Firestore directly.
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  Pending:      ["Scheduled", "Declined"],
  Scheduled:    ["Declined"],
  Accepted:     ["Arriving", "Declined"],
  Arriving:     ["In Transit", "Declined"],
  "In Transit": ["Completed", "Declined"],
  Rescheduled:  ["Scheduled", "Declined"],
  Completed:    [],
  Declined:     [],
};

function ContractorDetailsPanel({ item }: { item: RequestItem }) {
  const [contractorPhone, setContractorPhone] = useState<string | null>(null);

  useEffect(() => {
    setContractorPhone(null);
    if (!item.contractorId) return;
    getDoc(doc(db, "users", item.contractorId)).then((snap) => {
      setContractorPhone(snap.exists() ? (snap.data().mobileNumber || snap.data().phone || null) : null);
    });
  }, [item.contractorId]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 10,
      padding: "14px 16px", background: "#fbfdfb",
      borderRadius: 12, border: "1px solid #edf4f0",
    }}>
      <p style={{
        fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a",
        textTransform: "uppercase", letterSpacing: "0.04em", margin: 0,
      }}>
        Contractor Details
      </p>

      {item.contractorName && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#8aab97" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1a2e1f" }}>{item.contractorName}</span>
        </div>
      )}

      {contractorPhone && (
        <a href={`tel:${contractorPhone}`} style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#8aab97" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1a4d2e" }}>{contractorPhone}</span>
        </a>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#8aab97" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2 }}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1a2e1f" }}>{item.location}</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#8aab97" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1a2e1f" }}>{item.dates}</span>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <WasteTypeBadge type={item.wasteType} />
        <span style={{
          display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 999,
          background: "#f0f7f2", border: "1px solid #e8f2eb",
          fontSize: "0.7rem", fontWeight: 600, color: "#4a7a5a",
        }}>{item.yards}</span>
      </div>

      {item.note && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#8aab97" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2 }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#6b8f7a" }}>{item.note}</span>
        </div>
      )}
    </div>
  );
}

function DeclineReasonPanel({ reason }: { reason: string }) {
  return (
    <div style={{
      padding: "12px 16px",
      background: "rgba(239,68,68,0.06)",
      border: "1px solid rgba(239,68,68,0.2)",
      borderRadius: 12,
    }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#b91c1c", margin: "0 0 4px" }}>
        Decline Reason
      </p>
      <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#7f1d1d", margin: 0 }}>
        {reason}
      </p>
    </div>
  );
}

const OPERATOR_TIMELINE_STEPS = [
  { label: "Request submitted",    sub: "Contractor raised this pickup request" },
  { label: "Accepted by operator", sub: "You confirmed the job" },
  { label: "Pickup in progress",   sub: "Waste is being collected" },
  { label: "Completed",            sub: "Job successfully fulfilled by the operator" },
];

function RequestTimeline({ item }: { item: RequestItem }) {
  const declined = item.status === "Declined";
  const stamps = [item.createdAt, item.scheduledAt, item.arrivingAt || item.inTransitAt, item.completedAt];
  return (
    <div>
      <p style={{
        fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a",
        textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 12px",
      }}>
        Request Timeline
      </p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {OPERATOR_TIMELINE_STEPS.map((step, i, arr) => {
          const stamp = stamps[i];
          const done = declined ? i === 0 : !!stamp;
          const isDenied = declined && i > 0;
          const isLast = i === arr.length - 1;
          return (
            <div key={i} style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  background: isDenied ? "rgba(239,68,68,0.08)" : done ? "#1a4d2e" : "#f0f7f2",
                  border: isDenied ? "2px solid rgba(239,68,68,0.3)" : done ? "2px solid #1a4d2e" : "2px solid #c6e2d0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: 2,
                }}>
                  {isDenied ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 9, height: 9 }}>
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  ) : done ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 9, height: 9 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : null}
                </div>
                {!isLast && (
                  <div style={{
                    width: 2, flex: 1, minHeight: 20,
                    background: done && !isDenied ? "#1a4d2e" : "#e8f2eb",
                    margin: "3px 0",
                  }} />
                )}
              </div>
              <div style={{ paddingBottom: isLast ? 0 : 14, paddingTop: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: "0.8rem", fontWeight: 700, margin: 0,
                  color: isDenied ? "#b91c1c" : done ? "#1a2e1f" : "#9ab8a5",
                }}>
                  {step.label}
                </p>
                <p style={{
                  fontSize: "0.72rem", fontWeight: 600, margin: "2px 0 0",
                  color: isDenied ? "rgba(185,28,28,0.6)" : "#8aab97",
                }}>
                  {isDenied ? "Not applicable — request declined" : step.sub}
                </p>
                {stamp && !isDenied && (
                  <p style={{ fontSize: "0.66rem", fontWeight: 700, margin: "3px 0 0", color: "#4a7a5a" }}>
                    {stamp}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompletionProofPanel({ item }: { item: RequestItem }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadCompletedRequestReport({
        id: item.id,
        wasteType: item.wasteType,
        location: item.location,
        dates: item.dates,
        availability: item.availability || "",
        volume: item.yards,
        note: item.note,
        operatorName: item.operatorName,
        driverName: item.driverName,
        createdAt: item.createdAt,
        scheduledAt: item.scheduledAt,
        arrivingAt: item.arrivingAt,
        inTransitAt: item.inTransitAt,
        completedAt: item.completedAt,
        proofPhotoUrl: item.proofPhotoUrl,
        signatureUrl: item.signatureUrl,
        wasteTransferRecord: item.wasteTransferRecord,
      });
    } catch (err) {
      console.error("[CompletionProofPanel] Failed to generate PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 10,
      padding: "14px 16px", background: "#f8fbf6",
      border: "1px solid #edf4f0", borderRadius: 12,
    }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <p style={{
          fontSize: "0.72rem", fontWeight: 700, color: "#3a6b00",
          textTransform: "uppercase", letterSpacing: "0.04em", margin: 0,
        }}>
          Completion Proof
        </p>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#1a4d2e", border: "none", cursor: downloading ? "default" : "pointer",
            padding: "7px 12px", borderRadius: 8, flexShrink: 0,
            color: "#B8D52E", fontSize: "0.72rem", fontWeight: 700,
            fontFamily: "'Quicksand', sans-serif",
            opacity: downloading ? 0.7 : 1,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {downloading ? "Preparing…" : "Download Report (PDF)"}
        </button>
      </div>

      <RequestTimeline item={item} />

      {item.operatorName && (
        <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1a2e1f", margin: 0 }}>
          Completed by <strong>{item.operatorName}</strong>
        </p>
      )}

      {(item.proofPhotoUrl || item.signatureUrl) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {item.proofPhotoUrl && (
            <div style={{ flex: "1 1 120px" }}>
              <span style={{ fontSize: "0.66rem", fontWeight: 700, color: "#8aab97", display: "block", marginBottom: 5 }}>Site Photo</span>
              <a href={item.proofPhotoUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={item.proofPhotoUrl}
                  alt="Site proof"
                  style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #e8f2eb", display: "block" }}
                />
              </a>
            </div>
          )}
          {item.signatureUrl && (
            <div style={{ flex: "1 1 120px" }}>
              <span style={{ fontSize: "0.66rem", fontWeight: 700, color: "#8aab97", display: "block", marginBottom: 5 }}>Signature</span>
              <div style={{ background: "#fff", border: "1px solid #e8f2eb", borderRadius: 8, padding: 6 }}>
                <img
                  src={item.signatureUrl}
                  alt="Signature"
                  style={{ width: "100%", height: 88, objectFit: "contain", display: "block" }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RequestActionModal({
  item,
  onClose,
  onStatusChange,
  onCompleteStep1,
  onCompleteStep2,
  onDeclineConfirm,
  onAcceptReschedule,
}: {
  item: RequestItem | null;
  onClose: () => void;
  onStatusChange: (id: string, newDisplayStatus: string) => Promise<void>;
  onCompleteStep1: (id: string, data: { operatorName: string; photoFile: File; signatureBlob: Blob }) => Promise<void>;
  onCompleteStep2: (id: string, data: { wasteSignatureBlob: Blob; wasteTransfer: WasteTransferFormData }) => Promise<void>;
  onDeclineConfirm: (id: string, reason: string) => Promise<void>;
  onAcceptReschedule: (id: string, rescheduleData: { date: string; fromTime: string; toTime: string }) => Promise<void>;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<"complete" | "decline" | null>(null);

  useEffect(() => { setActiveForm(null); }, [item?.id]);

  if (!item) return null;

  const allowed = ALLOWED_TRANSITIONS[item.status] ?? [];
  const isRescheduled = item.status === "Rescheduled";
  const isBusy = loading !== null;

  const handleSimpleAction = async (displayStatus: string) => {
    setLoading(displayStatus);
    try { await onStatusChange(item.id, displayStatus); } finally { setLoading(null); }
  };

  const handleActionClick = (value: string) => {
    if (value === "Completed") { setActiveForm("complete"); return; }
    if (value === "Declined") { setActiveForm("decline"); return; }
    handleSimpleAction(value);
  };

  // Step 1 saves and marks the job completed right away — the modal stays
  // open (still on "complete") so the operator can continue to step 2.
  // `loading` here just guards the outer modal (e.g. its close button)
  // during the save; CompleteForm tracks its own button spinner separately.
  const handleStep1 = async (data: { operatorName: string; photoFile: File; signatureBlob: Blob }) => {
    setLoading("Completed");
    try { await onCompleteStep1(item.id, data); } finally { setLoading(null); }
  };

  // Step 2 updates the already-completed request with DEFRA details, then
  // the modal closes.
  const handleStep2 = async (data: { wasteSignatureBlob: Blob; wasteTransfer: WasteTransferFormData }) => {
    setLoading("Completed");
    try { await onCompleteStep2(item.id, data); setActiveForm(null); } finally { setLoading(null); }
  };

  const handleDeclineSubmit = async (reason: string) => {
    setLoading("Declined");
    try { await onDeclineConfirm(item.id, reason); setActiveForm(null); } finally { setLoading(null); }
  };

  const handleAcceptRescheduleClick = async () => {
    if (!item.rescheduleRequest) return;
    setLoading("AcceptReschedule");
    try {
      await onAcceptReschedule(item.id, {
        date: item.rescheduleRequest.date,
        fromTime: item.rescheduleRequest.fromTime,
        toTime: item.rescheduleRequest.toTime,
      });
    } finally {
      setLoading(null);
    }
  };

  const statusCfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.Pending;

  return (
    <>
      <div onClick={isBusy ? undefined : onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(10,26,15,0.45)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", pointerEvents: "none" }}>
        <div style={{ pointerEvents: "auto", background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "calc(100vh - 32px)", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", fontFamily: "'Quicksand', sans-serif" }}>

          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f0f7f2", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, position: "sticky", top: 0, background: "#ffffff", zIndex: 1 }}>
            <div>
              <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#9ab8a5", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{item.id.slice(0, 8).toUpperCase()}</p>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1a2e1f", margin: 0, lineHeight: 1.3 }}>{item.title}</h2>
            </div>
            <button onClick={isBusy ? undefined : onClose} style={{ background: "#f0f7f2", border: "none", borderRadius: 8, cursor: isBusy ? "not-allowed" : "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#4a7a5a", flexShrink: 0, opacity: isBusy ? 0.5 : 1 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style={{ padding: "20px 24px" }}>
            {activeForm === "complete" && (
              <CompleteForm loading={loading === "Completed"} onCancel={() => setActiveForm(null)} onStep1Complete={handleStep1} onStep2Complete={handleStep2} />
            )}
            {activeForm === "decline" && (
              <DeclineReasonForm loading={loading === "Declined"} onCancel={() => setActiveForm(null)} onSubmit={handleDeclineSubmit} />
            )}

            {!activeForm && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8fbf9", borderRadius: 12, border: "1px solid #edf4f0" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4a7a5a" }}>Current Logistics Status</span>
                  <StatusBadge status={item.status} />
                </div>

                <ContractorDetailsPanel item={item} />

                {(item.status === "Arriving" || item.status === "In Transit") && (
                  <div>
                    <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 8px" }}>
                      Your Live Location
                    </p>
                    <LiveTrackingMap
                      requestId={item.id}
                      location={item.location}
                      destinationLat={item.destinationLat}
                      destinationLng={item.destinationLng}
                      liveLocation={item.liveLocation}
                      operatorName={item.operatorName}
                      rawStatus={item.rawStatus}
                      height={220}
                    />
                  </div>
                )}

                {item.status === "Declined" && item.declineReason && (
                  <DeclineReasonPanel reason={item.declineReason} />
                )}

                {(item.operatorName || item.proofPhotoUrl || item.signatureUrl) && (
                  <CompletionProofPanel item={item} />
                )}

                {isRescheduled && item.rescheduleRequest && (
                  <div style={{ background: "rgba(139,92,246,0.05)", border: "1px dashed rgba(139,92,246,0.3)", borderRadius: 12, padding: "14px 16px" }}>
                    <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#7c3aed", margin: "0 0 4px" }}>Reschedule Offer from Contractor</p>
                    <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#5b4a78", margin: "0 0 12px" }}>"{item.rescheduleRequest.note}"</p>
                    <button type="button" onClick={handleAcceptRescheduleClick} disabled={loading === "AcceptReschedule"}
                      style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "#8b5cf6", color: "#ffffff", fontSize: "0.8rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
                      {loading === "AcceptReschedule" ? "Rescheduling Container..." : "Accept New Proposed Window"}
                    </button>
                  </div>
                )}

                {item.status === "Scheduled" && (
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)",
                    borderRadius: 10, padding: "10px 12px",
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <p style={{ fontSize: "0.76rem", fontWeight: 600, color: "#1d4ed8", margin: 0, lineHeight: 1.5 }}>
                      Waiting for the contractor to confirm this schedule. You can't mark this job Arriving until they accept it.
                    </p>
                  </div>
                )}

                {allowed.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b8f7a", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 2px" }}>Available Logistics Transitions</p>
                    {STATUS_FLOW.filter(f => allowed.includes(f.value)).map((flow) => (
                      <button key={flow.value} onClick={() => handleActionClick(flow.value)} disabled={isBusy}
                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", borderRadius: 10, border: flow.value === "Declined" ? "1px solid rgba(239,68,68,0.2)" : "1px solid #edf4f0", background: flow.bg, color: flow.color, fontSize: "0.84rem", fontWeight: 700, cursor: isBusy ? "not-allowed" : "pointer" }}>
                        {loading === flow.value ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14, animation: "wfSpin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : flow.icon}
                        {flow.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  !isRescheduled && (
                    <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#8aab97", textAlign: "center", margin: "12px 0" }}>This logistical workflow has terminated successfully.</p>
                  )
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default function OperatorRequestsPage() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "wasteRequests"),
      where("assignedOperatorId", "==", user.uid),
      orderBy("windowStart", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreRequest[];

      setRequests(docsData.map(mapDoc));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Dynamics Hook tracking operator coordinates during active transit periods
  useLiveLocationBroadcaster(requests, user?.uid);

  const handleStatusChange = async (id: string, displayStatus: string) => {
    const internalStatus = STATUS_WRITE[displayStatus];
    if (!internalStatus) return;
    const docRef = doc(db, "wasteRequests", id);
    const updates: Record<string, any> = { status: internalStatus };
    // Stamp the accepting operator so live-location broadcasting and
    // the contractor's tracking view can resolve who to follow.
    if (internalStatus === "scheduled") {
      updates.operatorId = user?.uid;
      updates.operatorName = profile?.fullName || profile?.businessName || "Operator";
      // The contractor must confirm this schedule before the operator can
      // progress any further — see ALLOWED_TRANSITIONS and the matching
      // firestore.rules check on 'arriving'.
      updates.awaitingUserConfirmation = true;
    }
    // Stamp when each stage happened so the contractor's request timeline
    // can show a real date/time next to each step, not just its label.
    const timestampField = STATUS_TIMESTAMP_FIELD[internalStatus];
    if (timestampField) updates[timestampField] = serverTimestamp();
    // Defensive backfill only — "Arriving" is required before "In Transit"
    // is reachable at all now (see ALLOWED_TRANSITIONS), so this should
    // normally already be set by the time we get here.
    if (internalStatus === "in_transit") {
      const existing = requests.find((r) => r.id === id);
      if (existing && !existing.arrivingAt) updates.arrivingAt = serverTimestamp();
    }
    await updateDoc(docRef, updates);
    logAdminEvent({
      type: "status_change",
      message: `Request moved to "${displayStatus}"`,
      targetId: id,
      meta: { toStatus: internalStatus },
    });
    setSelectedRequest(prev => prev ? { ...prev, status: displayStatus } : null);
  };

  // Step 1: saves the photo + collection signature, but deliberately does
  // NOT change status yet — "Completed" only happens once DEFRA details
  // (step 2) are in. The contractor can still download a report from this
  // point on (gated on proofPhotoUrl existing, not on status).
  const handleCompleteStep1 = async (id: string, data: { operatorName: string; photoFile: File; signatureBlob: Blob }) => {
    const photoUrl = await uploadToCloudinary(data.photoFile, `proof_${id}.jpg`);
    const signatureUrl = await uploadToCloudinary(data.signatureBlob, `signature_${id}.png`);
    const docRef = doc(db, "wasteRequests", id);
    await updateDoc(docRef, {
      operatorName: data.operatorName,
      driverName: profile?.fullName || "Driver",
      proofPhotoUrl: photoUrl,
      signatureUrl: signatureUrl,
      proofSubmittedAt: serverTimestamp(),
    });
    logAdminEvent({
      type: "status_change",
      message: `Completion proof captured by ${data.operatorName} — awaiting DEFRA details`,
      targetId: id,
      meta: {},
    });
  };

  // Step 2: this is the write that actually marks the job "Completed" —
  // along with the DEFRA waste transfer record, so the contractor's next
  // download includes it, and (re)fires the DEFRA submission.
  const handleCompleteStep2 = async (id: string, data: { wasteSignatureBlob: Blob; wasteTransfer: WasteTransferFormData }) => {
    const wasteSignatureUrl = await uploadToCloudinary(data.wasteSignatureBlob, `waste_signature_${id}.png`);
    const docRef = doc(db, "wasteRequests", id);
    await updateDoc(docRef, {
      status: "completed",
      completedAt: serverTimestamp(),
      wasteSignatureUrl,
      wasteTransferRecord: {
        ewcCode: data.wasteTransfer.ewcCode,
        wasteDescription: data.wasteTransfer.wasteDescription,
        physicalForm: data.wasteTransfer.physicalForm,
        isHazardous: data.wasteTransfer.isHazardous,
        weightAmount: data.wasteTransfer.weightAmount,
        weightUnit: data.wasteTransfer.weightUnit,
        weightEstimated: data.wasteTransfer.weightEstimated,
        disposalOrRecoveryCode: data.wasteTransfer.disposalOrRecoveryCode,
        receivingSiteName: data.wasteTransfer.receivingSiteName,
        receivingSiteAddress: data.wasteTransfer.receivingSiteAddress,
        receivingSitePostcode: data.wasteTransfer.receivingSitePostcode,
        receivingSiteAuthNumber: data.wasteTransfer.receivingSiteAuthNumber,
        carrierName: profile?.fullName || "",
        vehicleRegistration: profile?.vehicleRegistration || "",
        recordedAt: serverTimestamp(),
      },
    });
    logAdminEvent({
      type: "status_change",
      message: `Request marked completed — DEFRA waste transfer details recorded`,
      targetId: id,
      meta: { toStatus: "completed" },
    });
    setSelectedRequest(null);

    // Best-effort, non-blocking — the pickup is already done regardless of
    // whether DEFRA reporting succeeds. The route itself records why it
    // skipped/failed on the request doc so it's visible without holding up
    // this UI.
    auth.currentUser?.getIdToken().then((idToken) => {
      fetch("/api/defra/submit-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, requestId: id }),
      }).catch((err) => console.error("[DEFRA] Submission request failed:", err));
    });
  };

  const handleDeclineConfirm = async (id: string, reason: string) => {
    const docRef = doc(db, "wasteRequests", id);
    await updateDoc(docRef, {
      status: "declined",
      declineReason: reason,
      declinedAt: serverTimestamp(),
    });
    logAdminEvent({
      type: "status_change",
      message: `Request declined: ${reason}`,
      targetId: id,
      meta: { toStatus: "declined" },
    });
    setSelectedRequest(null);
  };

  const handleAcceptReschedule = async (id: string, rescheduleData: { date: string; fromTime: string; toTime: string }) => {
    const docRef = doc(db, "wasteRequests", id);
    await updateDoc(docRef, {
      status: "scheduled",
      windowStart: rescheduleData.date,
      windowEnd: rescheduleData.date,
      availability: `${rescheduleData.fromTime} - ${rescheduleData.toTime}`,
      rescheduleRequest: null,
      scheduledAt: serverTimestamp(),
      // Re-arm confirmation — the contractor should confirm the finalised
      // reschedule too before the operator can progress further.
      awaitingUserConfirmation: true,
    });
    logAdminEvent({
      type: "status_change",
      message: `Reschedule accepted for request`,
      targetId: id,
      meta: { toStatus: "scheduled" },
    });
    setSelectedRequest(null);
  };

  const filteredRequests = requests.filter((req) => {
    if (activeTab === "All") return true;
    return req.status === activeTab;
  });

  if (loading) {
    return <div style={{ padding: 24, fontFamily: "'Quicksand', sans-serif" }}>Loading operations hub...</div>;
  }

  if (profile?.kycStatus === "rejected") {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f4f9f5" }}>
        <Sidebar collapsed={false} onCollapse={() => {}} onExpand={() => {}} isOpen={true} onClose={() => {}} />
        <main style={{ flex: 1, padding: "32px 40px", fontFamily: "'Quicksand', sans-serif" }}>
          <div style={{
            maxWidth: 560, margin: "60px auto 0", textAlign: "center",
            background: "#ffffff", border: "1px solid #f5c6c6", borderRadius: 16, padding: 32,
          }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#c0392b", margin: 0 }}>
              Your KYC application was rejected
            </p>
            <p style={{ fontSize: "0.9rem", color: "#6b8f7a", margin: "10px 0 0", lineHeight: 1.6 }}>
              {profile?.kycRejectionReason
                ? profile.kycRejectionReason
                : "Contact WasteFlow support for more details."}
            </p>
            <p style={{ fontSize: "0.8rem", color: "#9ab8a5", margin: "16px 0 0" }}>
              You can't accept or manage pickup requests until this is resolved.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f9f5" }}>
      <Sidebar collapsed={false} onCollapse={() => {}} onExpand={() => {}} isOpen={true} onClose={() => {}} />
      <main style={{ flex: 1, padding: "32px 40px" }}>
        <header style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a2e1f", margin: 0, fontFamily: "'Quicksand', sans-serif" }}>
            Operator Requests Hub
          </h1>
          <p style={{ fontSize: "0.88rem", color: "#6b8f7a", margin: "4px 0 0", fontFamily: "'Quicksand', sans-serif" }}>
            Track, assign, and update logistical container transitions.
          </p>
        </header>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px", borderRadius: 99, fontSize: "0.82rem", fontWeight: 700,
                background: activeTab === tab ? "#1a4d2e" : "#ffffff",
                color: activeTab === tab ? "#B8D52E" : "#4a7a5a",
                border: activeTab === tab ? "1px solid #1a4d2e" : "1px solid #e8f2eb",
                cursor: "pointer", fontFamily: "'Quicksand', sans-serif", transition: "all 0.15s"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 20 }}>
          {filteredRequests.map((req) => (
            <RequestCard key={req.id} req={req} onViewDetails={(r) => setSelectedRequest(r)} />
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "#ffffff", borderRadius: 16, border: "1px dashed #c6e2d0", marginTop: 12 }}>
            <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#6b8f7a", margin: 0, fontFamily: "'Quicksand', sans-serif" }}>
              No requests found matching "{activeTab}" status.
            </p>
          </div>
        )}
      </main>

      {selectedRequest && (
        <RequestActionModal
          item={requests.find((r) => r.id === selectedRequest.id) ?? selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusChange={handleStatusChange}
          onCompleteStep1={handleCompleteStep1}
          onCompleteStep2={handleCompleteStep2}
          onDeclineConfirm={handleDeclineConfirm}
          onAcceptReschedule={handleAcceptReschedule}
        />
      )}
    </div>
  );
}
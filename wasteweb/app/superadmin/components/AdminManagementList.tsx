"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logAdminEvent } from "../../lib/adminLog";
import KycDetailModal from "./KycDetailModal";

const SHADOW_SM = "0 1px 2px rgba(16,24,18,0.06)";

interface ManagedAdmin {
  id: string;
  fullName: string;
  email: string;
  kycStatus: string;
  kycRejectionReason?: string;
  accountStatus: string;
  regions?: string[];
  createdAt: any;
}

const KYC_OPTIONS = ["pending", "submitted", "approved", "rejected"];

const KYC_BADGE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "rgba(251,191,36,0.12)", color: "#b45309" },
  submitted: { bg: "rgba(59,130,246,0.10)", color: "#1d4ed8" },
  approved:  { bg: "rgba(34,197,94,0.10)",  color: "#15803d" },
  rejected:  { bg: "rgba(239,68,68,0.10)",  color: "#b91c1c" },
};

function formatDate(ts: any): string {
  if (!ts?.seconds) return "N/A";
  return new Date(ts.seconds * 1000).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";
}

function Avatar({ name }: { name: string }) {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, #4a9a5a, #B8D52E)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.7rem", fontWeight: 800, color: "#0d2416",
    }}>
      {initials(name)}
    </div>
  );
}

function RejectReasonModal({
  admin, onCancel, onConfirm, submitting,
}: {
  admin: ManagedAdmin;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  submitting: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onCancel(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 500, background: "rgba(10,22,13,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div style={{
        width: "100%", maxWidth: 420, background: "#ffffff", borderRadius: 16,
        padding: 24, fontFamily: "'Quicksand', sans-serif", boxShadow: "0 16px 48px rgba(0,0,0,0.24)",
      }}>
        <p style={{ fontSize: "1rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>
          Reject KYC for {admin.fullName}
        </p>
        <p style={{ fontSize: "0.8rem", color: "#6b8f7a", margin: "4px 0 16px" }}>
          This reason is shown to the company on their dashboard, and they'll be blocked from
          performing operations until it's resolved.
        </p>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Companies House registration number could not be verified."
          rows={4}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 10,
            border: "1px solid #e8f2eb", background: "#f5faf6",
            fontSize: "0.85rem", fontWeight: 600, color: "#1a2e1f",
            fontFamily: "'Quicksand', sans-serif", outline: "none", resize: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            onClick={onCancel}
            disabled={submitting}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #e8f2eb",
              background: "#fff", color: "#4a7a5a", fontSize: "0.82rem", fontWeight: 700,
              fontFamily: "'Quicksand', sans-serif", cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={submitting || !reason.trim()}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10, border: "none",
              background: "#b91c1c", color: "#fff", fontSize: "0.82rem", fontWeight: 700,
              fontFamily: "'Quicksand', sans-serif",
              cursor: submitting || !reason.trim() ? "not-allowed" : "pointer",
              opacity: submitting || !reason.trim() ? 0.6 : 1,
            }}
          >
            {submitting ? "Rejecting…" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminManagementList({
  role, title, teamLabel, teamHref, teamCounts,
}: {
  role: "operatorAdmin" | "contractorAdmin";
  title: string;
  teamLabel: string;
  teamHref: (adminId: string) => string;
  teamCounts: Record<string, number>;
}) {
  const [admins, setAdmins] = useState<ManagedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewingKyc, setViewingKyc] = useState<ManagedAdmin | null>(null);
  const [rejecting, setRejecting] = useState<ManagedAdmin | null>(null);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", role));
    const unsub = onSnapshot(q, (snap) => {
      setAdmins(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            fullName: data.fullName || "N/A",
            email: data.email || "N/A",
            kycStatus: data.kycStatus || "pending",
            kycRejectionReason: data.kycRejectionReason || "",
            accountStatus: data.accountStatus || "active",
            regions: data.regions || [],
            createdAt: data.createdAt,
          };
        })
      );
      setLoading(false);
    });
    return () => unsub();
  }, [role]);

  async function toggleSuspend(a: ManagedAdmin) {
    setBusyId(a.id);
    const next = a.accountStatus === "suspended" ? "active" : "suspended";
    try {
      await updateDoc(doc(db, "users", a.id), { accountStatus: next });
      logAdminEvent({
        type: "admin_action",
        message: `${next === "suspended" ? "Suspended" : "Reinstated"} ${a.fullName} (${a.email})`,
        targetId: a.id,
        meta: { accountStatus: next },
      });
    } catch (err) {
      console.error("[AdminManagementList] Failed to update accountStatus:", err);
    } finally {
      setBusyId(null);
    }
  }

  async function overrideKyc(a: ManagedAdmin, kycStatus: string, reason?: string) {
    if (kycStatus === a.kycStatus) return;
    setBusyId(a.id);
    try {
      await updateDoc(doc(db, "users", a.id), {
        kycStatus,
        kycRejectionReason: kycStatus === "rejected" ? (reason || "") : "",
      });
      logAdminEvent({
        type: "admin_action",
        message: kycStatus === "rejected"
          ? `Rejected KYC of ${a.fullName} (${a.email}): ${reason}`
          : `Set KYC status of ${a.fullName} (${a.email}) to "${kycStatus}"`,
        targetId: a.id,
        meta: { kycStatus, reason },
      });
    } catch (err) {
      console.error("[AdminManagementList] Failed to update kycStatus:", err);
    } finally {
      setBusyId(null);
    }
  }

  function handleKycSelect(a: ManagedAdmin, kycStatus: string) {
    if (kycStatus === "rejected") {
      setRejecting(a);
      return;
    }
    overrideKyc(a, kycStatus);
  }

  async function confirmReject(reason: string) {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    await overrideKyc(rejecting, "rejected", reason);
    setRejecting(null);
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>{title}</h1>
      <p style={{ fontSize: "0.88rem", color: "#6b8f7a", margin: "4px 0 24px" }}>
        {loading ? "Loading…" : `${admins.length} compan${admins.length === 1 ? "y" : "ies"}`}
      </p>

      <div style={{
        background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 16,
        boxShadow: SHADOW_SM, overflowX: "auto", WebkitOverflowScrolling: "touch",
      }}>
        <table style={{ width: "100%", minWidth: 820, borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: "#f8fbf9", textAlign: "left" }}>
              {["Company", "KYC Status", "Account", "Regions", "Joined", teamLabel, "Actions"].map((h, i) => (
                <th key={i} style={{
                  padding: "12px 16px", fontSize: "0.66rem", fontWeight: 700, color: "#6b8f7a",
                  textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e8f2eb",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const kycStyle = KYC_BADGE[a.kycStatus] || KYC_BADGE.pending;
              return (
                <tr
                  key={a.id}
                  style={{ borderBottom: "1px solid #f0f7f2", transition: "background 0.12s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafcfa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={a.fullName} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{a.fullName}</p>
                        <p style={{ fontSize: "0.72rem", color: "#8aab97", margin: "1px 0 0" }}>{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <select
                          value={a.kycStatus}
                          disabled={busyId === a.id}
                          onChange={(e) => handleKycSelect(a, e.target.value)}
                          style={{
                            padding: "6px 8px", borderRadius: 8, border: "1px solid #e8f2eb",
                            fontSize: "0.76rem", fontWeight: 700, background: kycStyle.bg, color: kycStyle.color,
                          }}
                        >
                          {KYC_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => setViewingKyc(a)}
                          style={{
                            padding: "5px 10px", borderRadius: 8, border: "1px solid #e8f2eb",
                            background: "#f5faf6", color: "#1a4d2e", cursor: "pointer",
                            fontSize: "0.72rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif",
                            whiteSpace: "nowrap",
                          }}
                        >
                          View KYC
                        </button>
                      </div>
                      {a.kycStatus === "rejected" && a.kycRejectionReason && (
                        <p style={{ fontSize: "0.7rem", color: "#b91c1c", margin: 0, maxWidth: 220 }}>
                          {a.kycRejectionReason}
                        </p>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: "0.7rem", fontWeight: 700, padding: "3px 9px", borderRadius: 999,
                      background: a.accountStatus === "suspended" ? "rgba(239,68,68,0.10)" : "rgba(34,197,94,0.10)",
                      color: a.accountStatus === "suspended" ? "#b91c1c" : "#15803d",
                    }}>
                      {a.accountStatus}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6b8f7a", maxWidth: 200 }}>
                    {a.regions && a.regions.length > 0 ? a.regions.join(", ") : "N/A"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#8aab97" }}>{formatDate(a.createdAt)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <a
                      href={teamHref(a.id)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "6px 12px", borderRadius: 999, textDecoration: "none",
                        fontSize: "0.72rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif",
                        background: "rgba(184,213,46,0.14)", color: "#3a6b00",
                      }}
                    >
                      {teamCounts[a.id] || 0} · View →
                    </a>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => toggleSuspend(a)}
                      disabled={busyId === a.id}
                      style={{
                        padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                        fontSize: "0.75rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif",
                        background: a.accountStatus === "suspended" ? "#1a4d2e" : "#fee2e2",
                        color: a.accountStatus === "suspended" ? "#B8D52E" : "#b91c1c",
                        opacity: busyId === a.id ? 0.6 : 1,
                      }}
                    >
                      {a.accountStatus === "suspended" ? "Reinstate" : "Suspend"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && admins.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: "#9ab8a5" }}>
                  No companies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewingKyc && (
        <KycDetailModal
          userId={viewingKyc.id}
          userName={viewingKyc.fullName}
          onClose={() => setViewingKyc(null)}
        />
      )}

      {rejecting && (
        <RejectReasonModal
          admin={rejecting}
          submitting={busyId === rejecting.id}
          onCancel={() => setRejecting(null)}
          onConfirm={confirmReject}
        />
      )}
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logAdminEvent } from "../../lib/adminLog";
import LiveTrackingMap from "../../components/LiveTrackingMap";
import KycDetailModal from "./KycDetailModal";

const SHADOW_SM = "0 1px 2px rgba(16,24,18,0.06)";

interface ManagedUser {
  id: string;
  fullName: string;
  email: string;
  kycStatus: string;
  kycRejectionReason?: string;
  accountStatus: string;
  createdAt: any;
}

interface ActiveRequest {
  id: string;
  location: string;
  destinationLat?: number;
  destinationLng?: number;
  liveLocation: any;
  operatorName?: string;
  status: string;
}

const KYC_OPTIONS = ["pending", "submitted", "approved", "rejected"];

const KYC_BADGE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "rgba(251,191,36,0.12)", color: "#b45309" },
  submitted: { bg: "rgba(59,130,246,0.10)", color: "#1d4ed8" },
  approved:  { bg: "rgba(34,197,94,0.10)",  color: "#15803d" },
  rejected:  { bg: "rgba(239,68,68,0.10)",  color: "#b91c1c" },
};

function formatDate(ts: any): string {
  if (!ts?.seconds) return "—";
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

function TrackLiveModal({ user, request, onClose }: { user: ManagedUser; request: ActiveRequest; onClose: () => void }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 500, background: "rgba(10,22,13,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div style={{
        width: "100%", maxWidth: 520, background: "#ffffff", borderRadius: 16,
        padding: 20, fontFamily: "'Quicksand', sans-serif", boxShadow: "0 16px 48px rgba(0,0,0,0.24)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: "1rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>{user.fullName}</p>
            <p style={{ fontSize: "0.75rem", color: "#6b8f7a", margin: "2px 0 0" }}>Live location</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8, background: "#f5faf6", border: "none",
              cursor: "pointer", color: "#4a7a5a", fontSize: "0.9rem",
            }}
          >
            ✕
          </button>
        </div>
        <LiveTrackingMap
          requestId={request.id}
          location={request.location}
          destinationLat={request.destinationLat}
          destinationLng={request.destinationLng}
          liveLocation={request.liveLocation}
          operatorName={request.operatorName}
          rawStatus={request.status}
          height={320}
        />
      </div>
    </div>
  );
}

function RejectReasonModal({
  user, onCancel, onConfirm, submitting,
}: {
  user: ManagedUser;
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
          Reject KYC for {user.fullName}
        </p>
        <p style={{ fontSize: "0.8rem", color: "#6b8f7a", margin: "4px 0 16px" }}>
          This reason is shown to the user on their dashboard, and they'll be blocked from
          performing operations until it's resolved.
        </p>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Waste carrier licence document is expired — please re-upload a current one."
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

export default function UserManagementList(props: { role: "operator" | "contractor"; title: string }) {
  return (
    <Suspense fallback={<p style={{ color: "#9ab8a5", fontSize: "0.85rem" }}>Loading…</p>}>
      <UserManagementListInner {...props} />
    </Suspense>
  );
}

function UserManagementListInner({ role, title }: { role: "operator" | "contractor"; title: string }) {
  const searchParams = useSearchParams();
  const adminId = searchParams.get("adminId");
  const adminIdField = role === "operator" ? "operatorAdminId" : "contractorAdminId";

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeRequests, setActiveRequests] = useState<Record<string, ActiveRequest>>({});
  const [tracking, setTracking] = useState<{ user: ManagedUser; request: ActiveRequest } | null>(null);
  const [viewingKyc, setViewingKyc] = useState<ManagedUser | null>(null);
  const [rejecting, setRejecting] = useState<ManagedUser | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);

  useEffect(() => {
    if (!adminId) {
      setAdminName(null);
      return;
    }
    getDoc(doc(db, "users", adminId)).then((snap) => {
      setAdminName(snap.exists() ? (snap.data().fullName || "this company") : "this company");
    });
  }, [adminId]);

  useEffect(() => {
    const q = adminId
      ? query(collection(db, "users"), where("role", "==", role), where(adminIdField, "==", adminId))
      : query(collection(db, "users"), where("role", "==", role));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            fullName: data.fullName || "—",
            email: data.email || "—",
            kycStatus: data.kycStatus || "pending",
            kycRejectionReason: data.kycRejectionReason || "",
            accountStatus: data.accountStatus || "active",
            createdAt: data.createdAt,
          };
        })
      );
      setLoading(false);
    });
    return () => unsub();
  }, [role, adminId, adminIdField]);

  // One shared subscription for every request currently being tracked live,
  // keyed by whichever id (operatorId or contractorId) this page cares about
  // — avoids running a separate query per row.
  useEffect(() => {
    const idField = role === "operator" ? "operatorId" : "contractorId";
    const q = query(collection(db, "wasteRequests"), where("status", "in", ["arriving", "in_transit"]));
    const unsub = onSnapshot(q, (snap) => {
      const map: Record<string, ActiveRequest> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        const key = data[idField];
        if (!key) return;
        map[key] = {
          id: d.id,
          location: data.location || "—",
          destinationLat: typeof data.destinationLat === "number" ? data.destinationLat : undefined,
          destinationLng: typeof data.destinationLng === "number" ? data.destinationLng : undefined,
          liveLocation: data.liveLocation || null,
          operatorName: data.operatorName || "",
          status: data.status || "",
        };
      });
      setActiveRequests(map);
    });
    return () => unsub();
  }, [role]);

  async function toggleSuspend(u: ManagedUser) {
    setBusyId(u.id);
    const next = u.accountStatus === "suspended" ? "active" : "suspended";
    try {
      await updateDoc(doc(db, "users", u.id), { accountStatus: next });
      logAdminEvent({
        type: "admin_action",
        message: `${next === "suspended" ? "Suspended" : "Reinstated"} ${u.fullName} (${u.email})`,
        targetId: u.id,
        meta: { accountStatus: next },
      });
    } catch (err) {
      console.error("[UserManagementList] Failed to update accountStatus:", err);
    } finally {
      setBusyId(null);
    }
  }

  async function overrideKyc(u: ManagedUser, kycStatus: string, reason?: string) {
    if (kycStatus === u.kycStatus) return;
    setBusyId(u.id);
    try {
      await updateDoc(doc(db, "users", u.id), {
        kycStatus,
        kycRejectionReason: kycStatus === "rejected" ? (reason || "") : "",
      });
      logAdminEvent({
        type: "admin_action",
        message: kycStatus === "rejected"
          ? `Rejected KYC of ${u.fullName} (${u.email}): ${reason}`
          : `Set KYC status of ${u.fullName} (${u.email}) to "${kycStatus}"`,
        targetId: u.id,
        meta: { kycStatus, reason },
      });
    } catch (err) {
      console.error("[UserManagementList] Failed to update kycStatus:", err);
    } finally {
      setBusyId(null);
    }
  }

  function handleKycSelect(u: ManagedUser, kycStatus: string) {
    if (kycStatus === "rejected") {
      setRejecting(u);
      return;
    }
    overrideKyc(u, kycStatus);
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
      <p style={{ fontSize: "0.88rem", color: "#6b8f7a", margin: "4px 0 12px" }}>
        {loading ? "Loading…" : `${users.length} account${users.length === 1 ? "" : "s"}`}
      </p>

      {adminId && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
          background: "rgba(184,213,46,0.10)", border: "1px solid rgba(184,213,46,0.3)",
          borderRadius: 10, padding: "10px 14px", marginBottom: 16,
        }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1a4d2e", margin: 0 }}>
            Filtered to {adminName || "this company"}'s team
          </p>
          <Link href={`/superadmin/${role === "operator" ? "operators" : "contractors"}`} style={{
            fontSize: "0.76rem", fontWeight: 700, color: "#1a4d2e", textDecoration: "underline",
          }}>
            Clear filter
          </Link>
        </div>
      )}

      <div style={{
        background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 16,
        boxShadow: SHADOW_SM, overflowX: "auto", WebkitOverflowScrolling: "touch",
      }}>
        <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: "#f8fbf9", textAlign: "left" }}>
              {["Account", "KYC Status", "Account", "Joined", "Location", "Actions"].map((h, i) => (
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
            {users.map((u) => {
              const kycStyle = KYC_BADGE[u.kycStatus] || KYC_BADGE.pending;
              return (
                <tr
                  key={u.id}
                  style={{ borderBottom: "1px solid #f0f7f2", transition: "background 0.12s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafcfa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={u.fullName} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{u.fullName}</p>
                        <p style={{ fontSize: "0.72rem", color: "#8aab97", margin: "1px 0 0" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <select
                          value={u.kycStatus}
                          disabled={busyId === u.id}
                          onChange={(e) => handleKycSelect(u, e.target.value)}
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
                          onClick={() => setViewingKyc(u)}
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
                      {u.kycStatus === "rejected" && u.kycRejectionReason && (
                        <p style={{ fontSize: "0.7rem", color: "#b91c1c", margin: 0, maxWidth: 220 }}>
                          {u.kycRejectionReason}
                        </p>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: "0.7rem", fontWeight: 700, padding: "3px 9px", borderRadius: 999,
                      background: u.accountStatus === "suspended" ? "rgba(239,68,68,0.10)" : "rgba(34,197,94,0.10)",
                      color: u.accountStatus === "suspended" ? "#b91c1c" : "#15803d",
                    }}>
                      {u.accountStatus}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#8aab97" }}>{formatDate(u.createdAt)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {activeRequests[u.id] ? (
                      <button
                        onClick={() => setTracking({ user: u, request: activeRequests[u.id] })}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer",
                          fontSize: "0.72rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif",
                          background: "rgba(184,213,46,0.14)", color: "#3a6b00",
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3a6b00" }} />
                        Track Live
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#c6d9cc" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => toggleSuspend(u)}
                      disabled={busyId === u.id}
                      style={{
                        padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                        fontSize: "0.75rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif",
                        background: u.accountStatus === "suspended" ? "#1a4d2e" : "#fee2e2",
                        color: u.accountStatus === "suspended" ? "#B8D52E" : "#b91c1c",
                        opacity: busyId === u.id ? 0.6 : 1,
                      }}
                    >
                      {u.accountStatus === "suspended" ? "Reinstate" : "Suspend"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "32px 16px", textAlign: "center", color: "#9ab8a5" }}>
                  No {role}s found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {tracking && (
        <TrackLiveModal
          user={tracking.user}
          request={tracking.request}
          onClose={() => setTracking(null)}
        />
      )}

      {viewingKyc && (
        <KycDetailModal
          userId={viewingKyc.id}
          userName={viewingKyc.fullName}
          onClose={() => setViewingKyc(null)}
        />
      )}

      {rejecting && (
        <RejectReasonModal
          user={rejecting}
          submitting={busyId === rejecting.id}
          onCancel={() => setRejecting(null)}
          onConfirm={confirmReject}
        />
      )}
    </div>
  );
}

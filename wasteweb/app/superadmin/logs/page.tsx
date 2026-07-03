"use client";

import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface LogEntry {
  id: string;
  type: string;
  message: string;
  actorEmail: string | null;
  targetId: string | null;
  createdAt: any;
}

const SHADOW_SM = "0 1px 2px rgba(16,24,18,0.06)";

const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  user_signup:   { bg: "rgba(59,130,246,0.10)", color: "#1d4ed8" },
  login:         { bg: "rgba(100,116,139,0.10)", color: "#475569" },
  status_change: { bg: "rgba(184,213,46,0.14)", color: "#3a6b00" },
  admin_action:  { bg: "rgba(168,85,247,0.10)", color: "#7c3aed" },
};

function formatDateTime(ts: any): string {
  if (!ts?.seconds) return "—";
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function SuperAdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "adminLogs"), orderBy("createdAt", "desc"), limit(200));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLogs(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              type: data.type || "—",
              message: data.message || "—",
              actorEmail: data.actorEmail || null,
              targetId: data.targetId || null,
              createdAt: data.createdAt,
            };
          })
        );
        setLoading(false);
      },
      (err) => {
        console.error("[SuperAdminLogsPage] Failed to load logs:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>Audit Logs</h1>
      <p style={{ fontSize: "0.88rem", color: "#6b8f7a", margin: "4px 0 24px" }}>
        {loading ? "Loading…" : `Most recent ${logs.length} events`}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {logs.map((log) => {
          const style = TYPE_COLOR[log.type] || { bg: "#f0f7f2", color: "#4a7a5a" };
          return (
            <div key={log.id} style={{
              background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 12,
              padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
              boxShadow: SHADOW_SM,
            }}>
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, padding: "4px 9px", borderRadius: 999,
                background: style.bg, color: style.color, textTransform: "uppercase",
                letterSpacing: "0.04em", flexShrink: 0,
              }}>
                {log.type.replace("_", " ")}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a2e1f", margin: 0 }}>
                  {log.message}
                </p>
                {log.actorEmail && (
                  <p style={{ fontSize: "0.72rem", color: "#9ab8a5", margin: "2px 0 0" }}>
                    by {log.actorEmail}
                  </p>
                )}
              </div>
              <span style={{ fontSize: "0.72rem", color: "#9ab8a5", flexShrink: 0, whiteSpace: "nowrap" }}>
                {formatDateTime(log.createdAt)}
              </span>
            </div>
          );
        })}
        {!loading && logs.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "#9ab8a5" }}>
            No log entries yet.
          </div>
        )}
      </div>
    </div>
  );
}

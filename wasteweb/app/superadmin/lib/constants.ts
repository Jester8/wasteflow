export function formatDate(ts: any): string {
  if (!ts?.seconds) return "N/A";
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
    " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export const ACTIVE_STATUSES = ["pending", "scheduled", "arriving", "in_transit", "awaiting_reschedule"];

export const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "rgba(251,191,36,0.12)", color: "#b45309", label: "Pending" },
  scheduled: { bg: "rgba(59,130,246,0.10)", color: "#1d4ed8", label: "Scheduled" },
  arriving: { bg: "rgba(34,211,238,0.10)", color: "#0e7490", label: "Arriving" },
  in_transit: { bg: "rgba(168,85,247,0.10)", color: "#7c3aed", label: "In Transit" },
  completed: { bg: "rgba(184,213,46,0.14)", color: "#3a6b00", label: "Completed" },
  declined: { bg: "rgba(239,68,68,0.10)", color: "#b91c1c", label: "Declined" },
  cancelled: { bg: "rgba(239,68,68,0.10)", color: "#b91c1c", label: "Cancelled" },
  awaiting_reschedule: { bg: "rgba(139,92,246,0.12)", color: "#7c3aed", label: "Rescheduled" },
};

"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface PlatformUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  kycStatus: string;
  accountStatus: string;
  operatorAdminId?: string;
  contractorAdminId?: string;
  regions?: string[];
  createdAt: any;
}

export interface LiveJob {
  id: string;
  title: string;
  location: string;
  contractorName: string;
  operatorName?: string;
  status: string;
  destinationLat?: number;
  destinationLng?: number;
  liveLocation: {
    lat: number;
    lng: number;
    heading: number | null;
    speed: number | null;
    updatedAt: any;
  } | null;
}

interface RequestDoc {
  id: string;
  status: string;
  createdAt: any;
  targetOperatorAdminId?: string;
  contractorId?: string;
  contractorName?: string;
}

const TRACKING_STATUSES = new Set(["arriving", "in_transit"]);

export function useSuperAdminData() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [requests, setRequests] = useState<RequestDoc[]>([]);
  const [liveJobs, setLiveJobs] = useState<LiveJob[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          fullName: data.fullName || "N/A",
          email: data.email || "N/A",
          role: data.role || "",
          kycStatus: data.kycStatus || "pending",
          accountStatus: data.accountStatus || "active",
          operatorAdminId: data.operatorAdminId,
          contractorAdminId: data.contractorAdminId,
          regions: data.regions || [],
          createdAt: data.createdAt,
        } as PlatformUser;
      }));
      setUsersLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "wasteRequests"));
    const unsub = onSnapshot(q, (snap) => {
      const all: RequestDoc[] = [];
      const live: LiveJob[] = [];
      snap.docs.forEach((d) => {
        const data = d.data();
        all.push({
          id: d.id,
          status: data.status || "pending",
          createdAt: data.createdAt,
          targetOperatorAdminId: data.targetOperatorAdminId,
          contractorId: data.contractorId,
          contractorName: data.contractorName,
        });
        if (TRACKING_STATUSES.has(data.status) && data.liveLocation) {
          live.push({
            id: d.id,
            title: data.title || "Untitled",
            location: data.location || "N/A",
            contractorName: data.contractorName || "N/A",
            operatorName: data.operatorName || "N/A",
            status: data.status,
            destinationLat: typeof data.destinationLat === "number" ? data.destinationLat : undefined,
            destinationLng: typeof data.destinationLng === "number" ? data.destinationLng : undefined,
            liveLocation: data.liveLocation,
          });
        }
      });
      setRequests(all);
      setLiveJobs(live);
      setRequestsLoading(false);
    });
    return () => unsub();
  }, []);

  const operatorAdmins = useMemo(() => users.filter((u) => u.role === "operatorAdmin"), [users]);
  const contractorAdmins = useMemo(() => users.filter((u) => u.role === "contractorAdmin"), [users]);
  const drivers = useMemo(() => users.filter((u) => u.role === "operator"), [users]);
  const contractors = useMemo(() => users.filter((u) => u.role === "contractor"), [users]);

  const fleetSizeByAdmin = useMemo(() => {
    const counts: Record<string, number> = {};
    drivers.forEach((d) => {
      if (!d.operatorAdminId) return;
      counts[d.operatorAdminId] = (counts[d.operatorAdminId] || 0) + 1;
    });
    return counts;
  }, [drivers]);

  const contractorCountByAdmin = useMemo(() => {
    const counts: Record<string, number> = {};
    contractors.forEach((c) => {
      if (!c.contractorAdminId) return;
      counts[c.contractorAdminId] = (counts[c.contractorAdminId] || 0) + 1;
    });
    return counts;
  }, [contractors]);

  const requestCountByOperatorAdmin = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach((r) => {
      if (!r.targetOperatorAdminId) return;
      counts[r.targetOperatorAdminId] = (counts[r.targetOperatorAdminId] || 0) + 1;
    });
    return counts;
  }, [requests]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  }, [requests]);

  const trendDays = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = requests.filter((r) => {
        const ts = r.createdAt?.seconds ? r.createdAt.seconds * 1000 : null;
        return ts && ts >= d.getTime() && ts < next.getTime();
      }).length;
      days.push({ label: d.toLocaleDateString("en-GB", { weekday: "short" }), count });
    }
    return days;
  }, [requests]);

  return {
    users,
    usersLoading,
    requests,
    requestsLoading,
    liveJobs,
    operatorAdmins,
    contractorAdmins,
    drivers,
    contractors,
    fleetSizeByAdmin,
    contractorCountByAdmin,
    requestCountByOperatorAdmin,
    statusCounts,
    trendDays,
    loading: usersLoading || requestsLoading,
  };
}

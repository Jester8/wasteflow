"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { deriveRegionFromLocation } from "./ukRegion";
import { ACTIVE_STATUSES } from "./constants";

export interface Driver {
  id: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  vehicleRegistration?: string;
  skipCapacity?: number[];
  createdAt?: any;
}

export interface RequestRow {
  id: string;
  title: string;
  wasteType: string;
  contractorName: string;
  location: string;
  status: string;
  assignedOperatorId?: string;
  region?: string;
  createdAt: any;
}

export function useOperatorAdminData() {
  const { user, profile } = useAuth();
  const uid = user?.uid || "";
  const myRegions: string[] = profile?.regions || [];

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "users"), where("role", "==", "operator"), where("operatorAdminId", "==", uid));
    const unsub = onSnapshot(q, (snap) => {
      setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Driver)));
      setDriversLoading(false);
    });
    return () => unsub();
  }, [uid]);

  useEffect(() => {
    const q = query(collection(db, "wasteRequests"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || "Untitled",
          wasteType: data.wasteType || "General",
          contractorName: data.contractorName || "—",
          location: data.location || "—",
          status: data.status || "pending",
          assignedOperatorId: data.assignedOperatorId,
          region: data.region,
          createdAt: data.createdAt,
        } as RequestRow;
      }));
      setRequestsLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const untagged = requests.filter((r) => r.status === "pending" && !r.assignedOperatorId && !r.region);
    untagged.forEach(async (r) => {
      const region = deriveRegionFromLocation(r.location);
      try {
        await updateDoc(doc(db, "wasteRequests", r.id), { region });
      } catch {
        // another admin may have already tagged it — non-fatal
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]);

  const driverIds = useMemo(() => new Set(drivers.map((d) => d.id)), [drivers]);

  const activeJobCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach((r) => {
      if (r.assignedOperatorId && ACTIVE_STATUSES.includes(r.status)) {
        counts[r.assignedOperatorId] = (counts[r.assignedOperatorId] || 0) + 1;
      }
    });
    return counts;
  }, [requests]);

  const unassigned = useMemo(() => requests.filter((r) => {
    if (r.status !== "pending" || r.assignedOperatorId) return false;
    if (!r.region || r.region === "Unknown") return true;
    return myRegions.includes(r.region);
  }), [requests, myRegions]);

  const myFleetFeed = useMemo(
    () => requests.filter((r) => r.assignedOperatorId && driverIds.has(r.assignedOperatorId)),
    [requests, driverIds]
  );

  return {
    uid,
    profile,
    myRegions,
    drivers,
    requests,
    loading: driversLoading || requestsLoading,
    driverIds,
    activeJobCounts,
    unassigned,
    myFleetFeed,
  };
}

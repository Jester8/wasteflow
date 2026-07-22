"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { ACTIVE_STATUSES } from "./constants";

export interface SiteContractor {
  id: string;
  fullName: string;
  email: string;
  createdAt?: any;
}

export interface RequestRow {
  id: string;
  title: string;
  wasteType: string;
  location: string;
  status: string;
  contractorId: string;
  contractorName: string;
  targetOperatorAdminName?: string;
  createdAt: any;
}

export function useContractorAdminData() {
  const { user, profile } = useAuth();
  const uid = user?.uid || "";

  const [contractors, setContractors] = useState<SiteContractor[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [contractorsLoading, setContractorsLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "users"), where("role", "==", "contractor"), where("contractorAdminId", "==", uid));
    const unsub = onSnapshot(q, (snap) => {
      setContractors(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SiteContractor)));
      setContractorsLoading(false);
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
          location: data.location || "N/A",
          status: data.status || "pending",
          contractorId: data.contractorId,
          contractorName: data.contractorName || "N/A",
          targetOperatorAdminName: data.targetOperatorAdminName,
          createdAt: data.createdAt,
        } as RequestRow;
      }));
      setRequestsLoading(false);
    });
    return () => unsub();
  }, []);

  const contractorIds = useMemo(() => new Set(contractors.map((c) => c.id)), [contractors]);

  const myRequests = useMemo(
    () => requests.filter((r) => contractorIds.has(r.contractorId)),
    [requests, contractorIds]
  );

  const activeRequestCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    myRequests.forEach((r) => {
      if (ACTIVE_STATUSES.includes(r.status)) {
        counts[r.contractorId] = (counts[r.contractorId] || 0) + 1;
      }
    });
    return counts;
  }, [myRequests]);

  return {
    uid,
    profile,
    contractors,
    requests,
    myRequests,
    activeRequestCounts,
    loading: contractorsLoading || requestsLoading,
  };
}

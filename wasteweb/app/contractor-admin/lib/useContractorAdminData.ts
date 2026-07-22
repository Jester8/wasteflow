"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from "firebase/firestore";
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
  operatorName?: string;
  destinationLat?: number;
  destinationLng?: number;
  liveLocation?: {
    lat: number;
    lng: number;
    heading: number | null;
    speed: number | null;
    updatedAt: any;
  } | null;
  createdAt: any;
}

export function useContractorAdminData() {
  const { user, profile } = useAuth();
  const uid = user?.uid || "";

  const [contractors, setContractors] = useState<SiteContractor[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [contractorsLoading, setContractorsLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [contractorPasswords, setContractorPasswords] = useState<Record<string, string>>({});

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
    const missing = contractors.filter((c) => !(c.id in contractorPasswords));
    if (missing.length === 0) return;
    missing.forEach(async (c) => {
      const snap = await getDoc(doc(db, "users", c.id, "private", "creds"));
      setContractorPasswords((prev) => ({ ...prev, [c.id]: snap.exists() ? (snap.data().password || "") : "" }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractors]);

  async function refreshContractorPassword(contractorId: string) {
    const snap = await getDoc(doc(db, "users", contractorId, "private", "creds"));
    setContractorPasswords((prev) => ({ ...prev, [contractorId]: snap.exists() ? (snap.data().password || "") : "" }));
  }

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
          operatorName: data.operatorName,
          destinationLat: typeof data.destinationLat === "number" ? data.destinationLat : undefined,
          destinationLng: typeof data.destinationLng === "number" ? data.destinationLng : undefined,
          liveLocation: data.liveLocation || null,
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
    contractorPasswords,
    refreshContractorPassword,
  };
}

"use client";

import AdminManagementList from "../components/AdminManagementList";
import { useSuperAdminData } from "../lib/useSuperAdminData";

export default function SuperAdminContractorAdminsPage() {
  const { contractorCountByAdmin } = useSuperAdminData();

  return (
    <AdminManagementList
      role="contractorAdmin"
      title="Contractor Admins"
      teamLabel="Contractors"
      teamCounts={contractorCountByAdmin}
      teamHref={(adminId) => `/superadmin/contractors?adminId=${adminId}`}
    />
  );
}

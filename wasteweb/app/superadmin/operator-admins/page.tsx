"use client";

import AdminManagementList from "../components/AdminManagementList";
import { useSuperAdminData } from "../lib/useSuperAdminData";

export default function SuperAdminOperatorAdminsPage() {
  const { fleetSizeByAdmin } = useSuperAdminData();

  return (
    <AdminManagementList
      role="operatorAdmin"
      title="Operator Admins"
      teamLabel="Fleet"
      teamCounts={fleetSizeByAdmin}
      teamHref={(adminId) => `/superadmin/operators?adminId=${adminId}`}
    />
  );
}

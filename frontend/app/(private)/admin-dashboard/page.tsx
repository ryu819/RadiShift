import { Suspense } from "react";

import { AdminDashboard } from "@/components/admin/dashboard/AdminDashboard";
export default function page() {
  return (
    <Suspense fallback={null}>
      <AdminDashboard />
    </Suspense>
  );
}

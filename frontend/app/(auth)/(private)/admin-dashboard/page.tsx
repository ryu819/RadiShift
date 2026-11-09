import { Metadata } from "next";
import { Suspense } from "react";

import { Overview } from "@/components/admin/dashboard/overview/Overview";
import { RequireFacility } from "@/components/RequireFacility";

export const metadata: Metadata = {
  title: "管理画面TOP",
};

export default function AdminDashboardPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RequireFacility />
      </Suspense>
      <Overview />
    </>
  );
}

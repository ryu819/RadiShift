import { Metadata } from "next";
import { Suspense } from "react";

import { ShiftTypes } from "@/components/admin/dashboard/shift-types/ShiftTypes";
import { ShiftTypesSkeleton } from "@/components/admin/dashboard/shift-types/ShiftTypesSkeleton";
import { RequireFacility } from "@/components/RequireFacility";

export const metadata: Metadata = {
  title: "シフト設定",
};

export default function ShiftTypesPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RequireFacility />
      </Suspense>
      <Suspense fallback={<ShiftTypesSkeleton />}>
        <ShiftTypes />
      </Suspense>
    </>
  );
}

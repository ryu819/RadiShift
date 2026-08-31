import { Metadata } from "next";
import { Suspense } from "react";

import { ShiftTypes } from "@/components/admin/dashboard/shift-types/ShiftTypes";
import { ShiftTypesSkeleton } from "@/components/admin/dashboard/shift-types/ShiftTypesSkeleton";

export const metadata: Metadata = {
  title: "シフト設定",
};

export const prefetch = "partial";

export default function ShiftTypesPage() {
  return (
    <Suspense fallback={<ShiftTypesSkeleton />}>
      <ShiftTypes />
    </Suspense>
  );
}

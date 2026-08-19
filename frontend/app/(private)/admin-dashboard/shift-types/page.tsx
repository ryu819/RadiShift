import { Metadata } from "next";
import { Suspense } from "react";

import { ShiftTypes } from "@/components/admin/dashboard/shift-types/ShiftTypes";

export const metadata: Metadata = {
  title: "シフト設定",
};

export default function ShiftTypesPage() {
  return (
    <Suspense fallback={null}>
      <ShiftTypes />
    </Suspense>
  );
}

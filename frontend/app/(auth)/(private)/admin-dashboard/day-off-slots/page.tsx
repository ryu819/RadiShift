import { Metadata } from "next";
import { Suspense } from "react";

import { DayOffSlots } from "@/components/admin/dashboard/day-off-slots/DayOffSlots";
import { DayOffSlotsSkeleton } from "@/components/admin/dashboard/day-off-slots/DayOffSlotsSkeleton";

export const metadata: Metadata = {
  title: "休み枠",
};

type Props = {
  searchParams: Promise<{
    scheduleMonthId?: string;
  }>;
};

export default function DayOffSlotsPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<DayOffSlotsSkeleton />}>
      <DayOffSlots searchParams={searchParams} />
    </Suspense>
  );
}

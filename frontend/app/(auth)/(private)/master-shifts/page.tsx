import { CalendarDays } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";

import { MasterShifts } from "@/components/master-shift/MasterShifts";
import { MasterShiftsSkeleton } from "@/components/master-shift/MasterShiftsSkeleton";

export const metadata: Metadata = {
  title: "全体シフト",
};

type Props = {
  searchParams: Promise<{
    scheduleMonthId?: string;
  }>;
};

export default function MasterShiftPage({ searchParams }: Props) {
  return (
    <div className="flex min-h-0 flex-1 p-3 md:p-8">
      <div className="flex h-full  w-full flex-col gap-3 md:gap-6">
        <Suspense fallback={<MasterShiftsSkeleton />}>
          <MasterShifts searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

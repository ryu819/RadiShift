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
        <div className="flex items-center gap-1 text-xs md:gap-2 md:text-sm master-shift-print-hide">
          <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span>全体シフト</span>
        </div>

        <Suspense fallback={<MasterShiftsSkeleton />}>
          <MasterShifts searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

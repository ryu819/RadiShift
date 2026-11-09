import { Metadata } from "next";
import { Suspense } from "react";

import { MasterShifts } from "@/components/master-shift/MasterShifts";
import { MasterShiftsSkeleton } from "@/components/master-shift/MasterShiftsSkeleton";
import { RequireFacility } from "@/components/RequireFacility";

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
    <div className="flex min-h-0 flex-1 p-3 md:p-8 landscape:max-lg:py-1">
      <Suspense fallback={null}>
        <RequireFacility />
      </Suspense>
      <div className="flex h-full  w-full flex-col gap-3 md:gap-6 landscape:max-lg:gap-1">
        <Suspense fallback={<MasterShiftsSkeleton />}>
          <MasterShifts searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

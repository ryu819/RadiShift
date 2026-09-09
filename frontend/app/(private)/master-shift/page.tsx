import { CalendarDays, Printer } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";

import { MasterShift } from "@/components/master-shift/MasterShift";
import { MasterShiftSkeleton } from "@/components/master-shift/MasterShiftSkeleton";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-0 flex-1 p-3 md:px-8 md:py-6">
      <div className="flex h-full   w-full flex-col gap-1.5 md:gap-6">
        <div className="flex  items-center justify-between">
          <div className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
            <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span>全体シフト</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2 md:h-10 md:px-4"
          >
            <Printer className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="">印刷</span>
          </Button>
        </div>

        <Suspense fallback={<MasterShiftSkeleton />}>
          <MasterShift searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

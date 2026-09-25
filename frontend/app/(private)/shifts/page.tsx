import { Calendar } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { MyShift } from "@/components/my-shifts/MyShifts";
import { MyShiftsSkeleton } from "@/components/my-shifts/MyShiftsSkeleton";

export const metadata: Metadata = {
  title: "マイシフト",
};

type Props = {
  searchParams: Promise<{
    scheduleMonthId?: string;
  }>;
};

export default function MyShiftsPage({ searchParams }: Props) {
  return (
    <div className="flex flex-1 justify-center  p-3 md:p-8">
      <div className="w-full space-y-6">
        <div className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
          <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span>マイシフト</span>
        </div>

        <Suspense fallback={<MyShiftsSkeleton />}>
          <MyShift searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

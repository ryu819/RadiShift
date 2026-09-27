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
      <div className="flex h-full  w-full flex-col gap-3 md:gap-6">
        <Suspense fallback={<MyShiftsSkeleton />}>
          <MyShift searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

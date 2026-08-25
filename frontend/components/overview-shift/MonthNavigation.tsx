"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ScheduleMonths } from "@/types/schedule-months";

type Props = {
  scheduleMonths: ScheduleMonths[];
  selectedScheduleMonthId: number;
  year: number;
  month: number;
};

export function MonthNavigation({
  scheduleMonths,
  selectedScheduleMonthId,
  year,
  month,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const currentScheduleMonthIndex = scheduleMonths.findIndex(
    (scheduleMonth) => scheduleMonth.id === selectedScheduleMonthId,
  );

  const hasPrevMonth = currentScheduleMonthIndex > 0;

  const hasNextMonth =
    currentScheduleMonthIndex >= 0 &&
    currentScheduleMonthIndex < scheduleMonths.length - 1;

  const changeScheduleMonth = (nextIndex: number) => {
    const nextScheduleMonth = scheduleMonths[nextIndex];

    if (!nextScheduleMonth) return;

    router.push(`${pathname}?scheduleMonthId=${nextScheduleMonth.id}`);
  };

  const handlePrevMonth = () => {
    if (!hasPrevMonth) return;

    changeScheduleMonth(currentScheduleMonthIndex - 1);
  };

  const handleNextMonth = () => {
    if (!hasNextMonth) return;

    changeScheduleMonth(currentScheduleMonthIndex + 1);
  };
  return (
    <div className="flex items-center justify-center gap-1 md:gap-3">
      <Button
        variant="link"
        size="icon"
        onClick={handlePrevMonth}
        disabled={!hasPrevMonth}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <h1 className="text-xl font-semibold md:text-2xl">
        {`${year}年 ${month}月`}
      </h1>

      <Button
        variant="link"
        size="icon"
        onClick={handleNextMonth}
        disabled={!hasNextMonth}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

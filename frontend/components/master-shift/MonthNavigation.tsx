"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { ScheduleMonths } from "@/types/schedule-months";

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
  const pathname = usePathname();

  const currentScheduleMonthIndex = scheduleMonths.findIndex(
    (scheduleMonth) => scheduleMonth.id === selectedScheduleMonthId,
  );

  const previousScheduleMonth =
    currentScheduleMonthIndex > 0
      ? scheduleMonths[currentScheduleMonthIndex - 1]
      : null;

  const nextScheduleMonth =
    currentScheduleMonthIndex >= 0 &&
    currentScheduleMonthIndex < scheduleMonths.length - 1
      ? scheduleMonths[currentScheduleMonthIndex + 1]
      : null;

  return (
    <div className="flex items-center justify-center gap-1 md:gap-3">
      {previousScheduleMonth ? (
        <Button asChild variant="link" size="icon">
          <Link
            href={`${pathname}?scheduleMonthId=${previousScheduleMonth.id}`}
            prefetch={false}
            scroll={false}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      ) : (
        <Button type="button" variant="link" size="icon" disabled>
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
      )}

      <h1 className="text-xl font-semibold md:text-2xl">
        {`${year}年 ${month}月`}
      </h1>

      {nextScheduleMonth ? (
        <Button asChild variant="link" size="icon">
          <Link
            href={`${pathname}?scheduleMonthId=${nextScheduleMonth.id}`}
            prefetch={false}
            scroll={false}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      ) : (
        <Button type="button" variant="link" size="icon" disabled>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

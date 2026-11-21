"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ScheduleMonths } from "@/types/schedule-months";

type Props = {
  scheduleMonths: ScheduleMonths[];
  selectedScheduleMonthId: number;
  year: number;
  month: number;
  children?: React.ReactNode;
};

export function MonthNavigation({
  scheduleMonths,
  selectedScheduleMonthId,
  year,
  month,
  children,
}: Props) {
  const pathname = usePathname();

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-2 master-shift-print-hide">
      <h1 className="text-xl font-semibold md:text-2xl">
        {`${year}年 ${month}月`}
      </h1>

      {children}

      <div className="relative w-full overflow-x-auto">
        <Tabs
          value={String(selectedScheduleMonthId)}
          activationMode="manual"
          className="block"
        >
          <TabsList
            variant="line"
            className="flex h-8 w-max min-w-full justify-center border-b"
          >
            {scheduleMonths.map((scheduleMonth) => (
              <TabsTrigger
                key={scheduleMonth.id}
                value={String(scheduleMonth.id)}
                asChild
                className="cursor-pointer px-3 text-secondary data-[state=active]:text-primary"
              >
                <Link
                  href={`${pathname}?scheduleMonthId=${scheduleMonth.id}`}
                  scroll={false}
                  aria-label={`${scheduleMonth.year}年${scheduleMonth.month}月`}
                >
                  {`${scheduleMonth.month}月`}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}

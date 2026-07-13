import { CalendarDays, Printer } from "lucide-react";

import { MonthNavigation } from "@/components/overview-shift/MonthNavigation";
import { ShiftTable } from "@/components/overview-shift/ShiftTable";
import { Button } from "@/components/ui/button";
import { Member } from "@/types/member";
import { ScheduleMonth } from "@/types/schedule-month";
import { ScheduleMonths } from "@/types/schedule-months";
import { WorkAssignments } from "@/types/work-assignments";
import { WorkTypes } from "@/types/work-types";

type Props = {
  members: Member[] | null;
  workTypes: WorkTypes[] | null;
  workAssignments: WorkAssignments[] | null;
  scheduleMonths: ScheduleMonths[];
  scheduleMonth: ScheduleMonth | null;
  selectedScheduleMonthId: number;
};

export function OverviewShift({
  members,
  workTypes,
  workAssignments,
  scheduleMonths,
  scheduleMonth,
  selectedScheduleMonthId,
}: Props) {
  const days = scheduleMonth?.scheduleDays;

  return (
    <div className="flex min-h-0  flex-1 p-2 md:p-4">
      <div className="flex h-full   w-full flex-col gap-1.5 md:gap-6">
        <div className="flex  items-center justify-between">
          <div className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
            <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span>全体シフト</span>
          </div>

          <Button type="button" size="sm" className="h-8 px-2 md:h-10 md:px-4">
            <Printer className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="">印刷</span>
          </Button>
        </div>

        <MonthNavigation
          scheduleMonths={scheduleMonths}
          selectedScheduleMonthId={selectedScheduleMonthId}
          year={scheduleMonth?.year}
          month={scheduleMonth?.month}
        />

        <ShiftTable
          members={members}
          workTypes={workTypes}
          workAssignments={workAssignments}
          days={days}
          year={scheduleMonth?.year}
          month={scheduleMonth?.month}
        />
      </div>
    </div>
  );
}

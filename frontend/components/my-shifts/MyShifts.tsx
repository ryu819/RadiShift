import { Calendar, CircleHelp } from "lucide-react";

import { MonthNavigation } from "@/components/master-shift/MonthNavigation";
import { MyShiftsCalendar } from "@/components/my-shifts/MyShiftsCalendar";
import { MyShiftsEmpty } from "@/components/my-shifts/MyShiftsEmpty";
import { RequestsHistory } from "@/components/my-shifts/RequestsHistory";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getDayOffRequests } from "@/lib/actions/requests/get-day-off-requests";
import { getWorkRequests } from "@/lib/actions/requests/get-work-requests";
import { getScheduleMonth } from "@/lib/actions/schedule-months/get-schedule-month";
import { getScheduleMonths } from "@/lib/actions/schedule-months/get-schedule-months";
import { getMyShiftAssignments } from "@/lib/actions/shift-assignments/get-my-shift-assignments";
import { getDayOffTypes } from "@/lib/actions/shift-types/get-day-off-types";
import { getWorkTypes } from "@/lib/actions/shift-types/get-work-types";
import { getCurrentYearMonth } from "@/lib/get-current-year-month";
import { selectScheduleMonth } from "@/lib/select-schedule-month";

type Props = {
  searchParams: Promise<{
    scheduleMonthId?: string;
  }>;
};

export async function MyShift({ searchParams }: Props) {
  const params = await searchParams;

  const [scheduleMonthList, dayOffTypes, workTypes, currentYearMonth] =
    await Promise.all([
      getScheduleMonths(),
      getDayOffTypes(),
      getWorkTypes(),
      getCurrentYearMonth(),
    ]);

  if (!scheduleMonthList || scheduleMonthList.length === 0) {
    return <MyShiftsEmpty />;
  }

  const requestedScheduleMonthId = params.scheduleMonthId
    ? Number(params.scheduleMonthId)
    : null;

  const selectedScheduleMonth = selectScheduleMonth({
    scheduleMonths: scheduleMonthList,
    requestedScheduleMonthId,
    currentYearMonth,
  });

  const [scheduleMonth, myShiftAssignments, dayOffRequests, workRequests] =
    await Promise.all([
      getScheduleMonth(selectedScheduleMonth.id),
      getMyShiftAssignments(selectedScheduleMonth.id),
      getDayOffRequests(selectedScheduleMonth.id),
      getWorkRequests(selectedScheduleMonth.id),
    ]);

  if (!scheduleMonth) {
    return <MyShiftsEmpty />;
  }

  return (
    <>
      <div className="master-shift-print-hide flex items-center justify-between text-xs md:text-sm">
        <div className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
          <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span>マイシフト</span>
        </div>

        <Popover>
          <PopoverTrigger className="flex  items-center cursor-pointer gap-1 transition-colors hover:text-primary active:text-primary">
            <CircleHelp className="size-3" />
            ヘルプ
          </PopoverTrigger>

          <PopoverContent
            align="end"
            sideOffset={6}
            className="w-72 space-y-1 p-3 text-secondary"
          >
            <p className="text-sm font-medium">使い方</p>

            <ul className="list-disc space-y-1 pl-4 text-sm">
              <li>日付セルを選択すると、シフト希望を申請できます</li>

              <li>今日以前の日付には申請はできません</li>

              <li>「返上」は、現在の割当を返すための申請です</li>
            </ul>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <MonthNavigation
          scheduleMonths={scheduleMonthList}
          selectedScheduleMonthId={selectedScheduleMonth.id}
          year={selectedScheduleMonth.year}
          month={selectedScheduleMonth.month}
        />

        {scheduleMonth?.isPublished ? (
          <Badge className="bg-emerald-100 text-emerald-700 rounded-sm">
            シフト公開済
          </Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-700 rounded-sm">
            シフト未公開
          </Badge>
        )}
      </div>

      <div className="space-y-4 ">
        <MyShiftsCalendar
          scheduleMonth={scheduleMonth}
          dayOffTypes={dayOffTypes ?? []}
          workTypes={workTypes ?? []}
          dayOffAssignments={myShiftAssignments?.dayOffAssignments ?? []}
          workAssignments={myShiftAssignments?.workAssignments ?? []}
          modalityAssignments={myShiftAssignments?.modalityAssignments ?? []}
        />

        <RequestsHistory
          dayOffRequests={dayOffRequests ?? []}
          workRequests={workRequests ?? []}
        />
      </div>
    </>
  );
}

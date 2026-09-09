import { MonthNavigation } from "@/components/master-shift/MonthNavigation";
import { MyShiftsCalendar } from "@/components/my-shifts/MyShiftsCalendar";
import { MyShiftsEmpty } from "@/components/my-shifts/MyShiftsEmpty";
import { RequestsHistory } from "@/components/my-shifts/RequestsHistory";
import { Badge } from "@/components/ui/badge";
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
  const [params, scheduleMonths, dayOffTypes, workTypes, currentYearMonth] =
    await Promise.all([
      searchParams,
      getScheduleMonths(),
      getDayOffTypes(),
      getWorkTypes(),
      getCurrentYearMonth(),
    ]);

  const scheduleMonthList = scheduleMonths ?? [];

  if (scheduleMonthList.length === 0) {
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

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-2">
        <MonthNavigation
          scheduleMonths={scheduleMonthList}
          selectedScheduleMonthId={selectedScheduleMonth.id}
          year={selectedScheduleMonth.year}
          month={selectedScheduleMonth.month}
        />

        {scheduleMonth?.status === "accepting_requests" && (
          <Badge className="bg-amber-100 text-amber-700 rounded-sm">
            シフト未公開
          </Badge>
        )}

        {scheduleMonth?.status === "published" && (
          <Badge className="bg-emerald-100 text-emerald-700 rounded-sm">
            シフト公開済
          </Badge>
        )}
      </div>

      <div className="space-y-4 ">
        <MyShiftsCalendar
          scheduleDays={scheduleMonth?.scheduleDays ?? []}
          selectedScheduleMonthId={selectedScheduleMonth.id}
          dayOffTypes={dayOffTypes ?? []}
          workTypes={workTypes ?? []}
          dayOffAssignment={myShiftAssignments?.dayOffAssignments ?? []}
          workAssignments={myShiftAssignments?.workAssignments ?? []}
        />

        <RequestsHistory
          dayOffRequests={dayOffRequests ?? []}
          workRequests={workRequests ?? []}
        />
      </div>
    </>
  );
}

import { MasterShiftsEmpty } from "@/components/master-shift/MasterShiftsEmpty";
import { MonthNavigation } from "@/components/master-shift/MonthNavigation";
import { ShiftTable } from "@/components/master-shift/ShiftTable";
import { getMembers } from "@/lib/actions/members/get-members";
import { getScheduleMonth } from "@/lib/actions/schedule-months/get-schedule-month";
import { getScheduleMonths } from "@/lib/actions/schedule-months/get-schedule-months";
import { getMasterShiftAssignments } from "@/lib/actions/shift-assignments/get-master-shift-assignments";
import { getDayOffTypes } from "@/lib/actions/shift-types/get-day-off-types";
import { getWorkTypes } from "@/lib/actions/shift-types/get-work-types";
import { getCurrentYearMonth } from "@/lib/get-current-year-month";
import { selectScheduleMonth } from "@/lib/select-schedule-month";

type Props = {
  searchParams: Promise<{
    scheduleMonthId?: string;
  }>;
};

export async function MasterShifts({ searchParams }: Props) {
  const [
    params,
    members,
    workTypes,
    dayOffTypes,
    scheduleMonths,
    currentYearMonth,
  ] = await Promise.all([
    searchParams,
    getMembers(),
    getWorkTypes(),
    getDayOffTypes(),
    getScheduleMonths(),
    getCurrentYearMonth(),
  ]);

  const requestedScheduleMonthId = params.scheduleMonthId
    ? Number(params.scheduleMonthId)
    : null;

  const scheduleMonthList = scheduleMonths ?? [];

  if (scheduleMonthList.length === 0) {
    return <MasterShiftsEmpty />;
  }

  const selectedScheduleMonth = selectScheduleMonth({
    scheduleMonths: scheduleMonthList,
    requestedScheduleMonthId,
    currentYearMonth,
  });

  const [scheduleMonth, masterShiftAssignments] = await Promise.all([
    getScheduleMonth(selectedScheduleMonth.id),
    getMasterShiftAssignments(selectedScheduleMonth.id),
  ]);

  return (
    <>
      <MonthNavigation
        scheduleMonths={scheduleMonthList}
        selectedScheduleMonthId={selectedScheduleMonth.id}
        year={selectedScheduleMonth.year}
        month={selectedScheduleMonth.month}
      />

      <ShiftTable
        members={members ?? []}
        workTypes={workTypes ?? []}
        dayOffTypes={dayOffTypes ?? []}
        workAssignmentsByUserAndDay={
          masterShiftAssignments?.workAssignmentsByUserAndDay ?? {}
        }
        dayOffAssignmentsByUserAndDay={
          masterShiftAssignments?.dayOffAssignmentsByUserAndDay ?? {}
        }
        days={scheduleMonth?.scheduleDays ?? []}
        year={selectedScheduleMonth.year}
        month={selectedScheduleMonth.month}
      />
    </>
  );
}

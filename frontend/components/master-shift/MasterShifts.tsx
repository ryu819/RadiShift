import { MasterShiftsEmpty } from "@/components/master-shift/MasterShiftsEmpty";
import { MonthNavigation } from "@/components/master-shift/MonthNavigation";
import { ShiftTable } from "@/components/master-shift/ShiftTable";
import { getCurrentUser } from "@/lib/actions/account/get-current-user";
import { getMasterShiftScheduleMonths } from "@/lib/actions/schedule-months/get-master-shift-schedule-months";
import { getScheduleMonth } from "@/lib/actions/schedule-months/get-schedule-month";
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
  const params = await searchParams;

  const [
    currentUser,
    workTypes,
    dayOffTypes,
    scheduleMonths,
    currentYearMonth,
  ] = await Promise.all([
    getCurrentUser(),
    getWorkTypes(),
    getDayOffTypes(),
    getMasterShiftScheduleMonths(),
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
        members={masterShiftAssignments?.members ?? []}
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
        isEditable={currentUser?.isAdmin ?? false}
      />
    </>
  );
}

import { MasterShiftEmpty } from "@/components/master-shift/MasterShiftEmpty";
import { MonthNavigation } from "@/components/master-shift/MonthNavigation";
import { ShiftTable } from "@/components/master-shift/ShiftTable";
import { getMembers } from "@/lib/actions/members/get-members";
import { getScheduleMonth } from "@/lib/actions/schedule-months/get-schedule-month";
import { getScheduleMonths } from "@/lib/actions/schedule-months/get-schedule-months";
import { getMasterShiftAssignments } from "@/lib/actions/shift-assignments/get-master-shift-assignments";
import { getWorkTypes } from "@/lib/actions/shift-types/get-work-types";
import { getCurrentYearMonth } from "@/lib/get-current-year-month";
import { selectScheduleMonth } from "@/lib/select-schedule-month";

type Props = {
  searchParams: Promise<{
    scheduleMonthId?: string;
  }>;
};

export async function MasterShift({ searchParams }: Props) {
  const [params, members, workTypes, scheduleMonths, currentYearMonth] =
    await Promise.all([
      searchParams,
      getMembers(),
      getWorkTypes(),
      getScheduleMonths(),
      getCurrentYearMonth(),
    ]);

  const requestedScheduleMonthId = params.scheduleMonthId
    ? Number(params.scheduleMonthId)
    : null;

  const scheduleMonthList = scheduleMonths ?? [];

  if (scheduleMonthList.length === 0) {
    return <MasterShiftEmpty />;
  }

  const selectedScheduleMonth = selectScheduleMonth({
    scheduleMonths: scheduleMonthList,
    requestedScheduleMonthId,
    currentYearMonth,
  });

  const [scheduleMonth, masterShiftAssignments] = await Promise.all([
    getScheduleMonth(selectedScheduleMonth.id),
    getMasterShiftAssignments(
      selectedScheduleMonth.year,
      selectedScheduleMonth.month,
    ),
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

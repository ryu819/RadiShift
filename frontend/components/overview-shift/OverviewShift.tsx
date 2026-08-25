import { MonthNavigation } from "@/components/overview-shift/MonthNavigation";
import { OverviewShiftEmpty } from "@/components/overview-shift/OverviewShiftEmpty";
import { ShiftTable } from "@/components/overview-shift/ShiftTable";
import { getMembers } from "@/lib/actions/get-members";
import { getScheduleMonth } from "@/lib/actions/get-schedule-month";
import { getScheduleMonths } from "@/lib/actions/get-schedule-months";
import { getWorkAssignments } from "@/lib/actions/get-work-assignments";
import { getWorkTypes } from "@/lib/actions/get-work-types";

type Props = {
  searchParams: Promise<{
    scheduleMonthId?: string;
  }>;
};

export async function OverviewShift({ searchParams }: Props) {
  const [params, members, workTypes, scheduleMonths] = await Promise.all([
    searchParams,
    getMembers(),
    getWorkTypes(),
    getScheduleMonths(),
  ]);

  const requestedScheduleMonthId = params.scheduleMonthId
    ? Number(params.scheduleMonthId)
    : null;

  const scheduleMonthList = scheduleMonths ?? [];

  if (scheduleMonthList.length === 0) {
    return <OverviewShiftEmpty />;
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const selectedScheduleMonth =
    scheduleMonthList.find(
      (scheduleMonth) => scheduleMonth.id === requestedScheduleMonthId,
    ) ??
    scheduleMonthList.find(
      (scheduleMonth) =>
        scheduleMonth.year === currentYear &&
        scheduleMonth.month === currentMonth,
    ) ??
    scheduleMonthList[scheduleMonthList.length - 1];

  const [scheduleMonth, workAssignments] = await Promise.all([
    getScheduleMonth(selectedScheduleMonth.id),
    getWorkAssignments(selectedScheduleMonth.year, selectedScheduleMonth.month),
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
        workAssignments={workAssignments ?? []}
        days={scheduleMonth?.scheduleDays}
        year={selectedScheduleMonth.year}
        month={selectedScheduleMonth.month}
      />
    </>
  );
}

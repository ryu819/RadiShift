import { OverviewShift } from "@/components/overview-shift/OverviewShift";
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

export async function OverviewServer({ searchParams }: Props) {
  const params = await searchParams;

  const requestedScheduleMonthId = params.scheduleMonthId
    ? Number(params.scheduleMonthId)
    : null;
  const [members, workTypes, scheduleMonths] = await Promise.all([
    getMembers(),
    getWorkTypes(),
    getScheduleMonths(),
  ]);

  const scheduleMonthList = scheduleMonths ?? [];

  if (scheduleMonthList.length === 0) {
    return <div>新しいシフト月を作成してください</div>;
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const selectedScheduleMonth =
    // URLで指定された月
    scheduleMonthList.find(
      (scheduleMonth) => scheduleMonth.id === requestedScheduleMonthId,
    ) ??
    // 今月
    scheduleMonthList.find(
      (scheduleMonth) =>
        scheduleMonth.year === currentYear &&
        scheduleMonth.month === currentMonth,
    ) ??
    // 今月がなければ最後の月
    scheduleMonthList[scheduleMonthList.length - 1];

  const [scheduleMonth, workAssignments] = await Promise.all([
    getScheduleMonth(selectedScheduleMonth.id),
    getWorkAssignments(selectedScheduleMonth.year, selectedScheduleMonth.month),
  ]);

  return (
    <OverviewShift
      members={members}
      workTypes={workTypes}
      workAssignments={workAssignments}
      scheduleMonths={scheduleMonthList}
      scheduleMonth={scheduleMonth}
      selectedScheduleMonthId={selectedScheduleMonth.id}
    />
  );
}

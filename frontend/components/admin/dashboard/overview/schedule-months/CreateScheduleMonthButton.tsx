import { ScheduleMonthCreateDialogForm } from "@/components/admin/dashboard/overview/schedule-months/ScheduleMonthCreateDialogForm";
import { getScheduleMonths } from "@/lib/actions/schedule-months/get-schedule-months";
import { getCurrentYearMonth } from "@/lib/get-current-year-month";
import { ScheduleMonths } from "@/types/schedule-months";

function getNextScheduleMonth(latestScheduleMonth: ScheduleMonths) {
  if (latestScheduleMonth.month === 12) {
    return {
      year: latestScheduleMonth.year + 1,
      month: 1,
    };
  }

  return {
    year: latestScheduleMonth.year,
    month: latestScheduleMonth.month + 1,
  };
}

export async function CreateScheduleMonthButton() {
  const scheduleMonths = (await getScheduleMonths()) ?? [];

  const latestScheduleMonth = scheduleMonths[scheduleMonths.length - 1];

  const nextScheduleMonth = latestScheduleMonth
    ? getNextScheduleMonth(latestScheduleMonth)
    : await getCurrentYearMonth();

  return (
    <ScheduleMonthCreateDialogForm
      year={nextScheduleMonth.year}
      month={nextScheduleMonth.month}
    />
  );
}

import { CreateScheduleMonthDialog } from "@/components/admin/dashboard/CreateScheduleMonthDialog";
import { getScheduleMonths } from "@/lib/actions/get-schedule-months";
import { ScheduleMonths } from "@/types/schedule-months";

export async function CreateScheduleMonthButton() {
  const scheduleMonths = await getScheduleMonths();

  const nextScheduleMonth = getNextScheduleMonth(scheduleMonths ?? []);

  return (
    <CreateScheduleMonthDialog
      year={nextScheduleMonth.year}
      month={nextScheduleMonth.month}
    />
  );
}

function getNextScheduleMonth(scheduleMonths: ScheduleMonths[]) {
  const latestScheduleMonth = scheduleMonths[scheduleMonths.length - 1];

  if (!latestScheduleMonth) {
    const today = new Date();

    return {
      year: today.getFullYear(),
      month: today.getMonth(),
    };
  }

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

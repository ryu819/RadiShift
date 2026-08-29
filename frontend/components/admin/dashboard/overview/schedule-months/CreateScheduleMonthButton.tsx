import { ScheduleMonthCreateDialogForm } from "@/components/admin/dashboard/overview/schedule-months/ScheduleMonthCreateDialogForm";
import { APP_TIME_ZONE } from "@/constants/time-zone";
import { getScheduleMonths } from "@/lib/actions/schedule-months/get-schedule-months";
import { dayjs } from "@/lib/dayjs";
import { ScheduleMonths } from "@/types/schedule-months";

export async function CreateScheduleMonthButton() {
  const scheduleMonths = await getScheduleMonths();

  const nextScheduleMonth = getNextScheduleMonth(scheduleMonths ?? []);

  return (
    <ScheduleMonthCreateDialogForm
      year={nextScheduleMonth.year}
      month={nextScheduleMonth.month}
    />
  );
}

function getNextScheduleMonth(scheduleMonths: ScheduleMonths[]) {
  const latestScheduleMonth = scheduleMonths[scheduleMonths.length - 1];

  if (!latestScheduleMonth) {
    const currentMonth = dayjs().tz(APP_TIME_ZONE);

    return {
      year: currentMonth.year(),
      month: Number(currentMonth.format("M")),
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

import { APP_TIME_ZONE } from "@/constants/time-zone";
import { dayjs } from "@/lib/dayjs";
import type { ScheduleMonths } from "@/types/schedule-months";

type SelectScheduleMonthParams = {
  scheduleMonths: ScheduleMonths[];
  requestedScheduleMonthId: number | null;
};

export function selectScheduleMonth({
  scheduleMonths,
  requestedScheduleMonthId,
}: SelectScheduleMonthParams) {
  const tokyoNow = dayjs().tz(APP_TIME_ZONE);

  const currentYear = tokyoNow.year();
  const currentMonth = Number(tokyoNow.format("M"));

  return (
    scheduleMonths.find(
      (scheduleMonth) => scheduleMonth.id === requestedScheduleMonthId,
    ) ??
    scheduleMonths.find(
      (scheduleMonth) =>
        scheduleMonth.year === currentYear &&
        scheduleMonth.month === currentMonth,
    ) ??
    scheduleMonths[scheduleMonths.length - 1]
  );
}

import type { ScheduleMonths } from "@/types/schedule-months";

type CurrentYearMonth = {
  year: number;
  month: number;
};

type SelectScheduleMonthParams = {
  scheduleMonths: ScheduleMonths[];
  requestedScheduleMonthId: number | null;
  currentYearMonth: CurrentYearMonth;
};

export function selectScheduleMonth({
  scheduleMonths,
  requestedScheduleMonthId,
  currentYearMonth,
}: SelectScheduleMonthParams) {
  return (
    scheduleMonths.find(
      (scheduleMonth) => scheduleMonth.id === requestedScheduleMonthId,
    ) ??
    scheduleMonths.find(
      (scheduleMonth) =>
        scheduleMonth.year === currentYearMonth.year &&
        scheduleMonth.month === currentYearMonth.month,
    ) ??
    scheduleMonths[scheduleMonths.length - 1]
  );
}

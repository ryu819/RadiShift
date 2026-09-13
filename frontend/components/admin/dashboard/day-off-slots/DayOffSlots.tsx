import { DayOffSlotCalendarCard } from "@/components/admin/dashboard/day-off-slots/calendar/DayOffSlotCalendarCard";
import { DayOffSlotRuleSettingsCard } from "@/components/admin/dashboard/day-off-slots/rules/DayOffSlotRuleSettingsCard";
import { getDayOffSlotRules } from "@/lib/actions/day-off-slots/get-day-off-slot-rules";
import { getScheduleMonth } from "@/lib/actions/schedule-months/get-schedule-month";
import { getScheduleMonths } from "@/lib/actions/schedule-months/get-schedule-months";
import { getDayOffTypes } from "@/lib/actions/shift-types/get-day-off-types";
import { getCurrentYearMonth } from "@/lib/get-current-year-month";
import { selectScheduleMonth } from "@/lib/select-schedule-month";

type Props = {
  searchParams: Promise<{
    scheduleMonthId?: string;
  }>;
};

export async function DayOffSlots({ searchParams }: Props) {
  const params = await searchParams;

  const requestedScheduleMonthId = params.scheduleMonthId
    ? Number(params.scheduleMonthId)
    : null;

  const [dayOffTypes, dayOffSlotRules, scheduleMonths, currentYearMonth] =
    await Promise.all([
      getDayOffTypes(),
      getDayOffSlotRules(),
      getScheduleMonths(),
      getCurrentYearMonth(),
    ]);

  const scheduleMonthList = scheduleMonths ?? [];

  const selectedScheduleMonth = selectScheduleMonth({
    scheduleMonths: scheduleMonthList,
    requestedScheduleMonthId,
    currentYearMonth,
  });

  const scheduleMonth = selectedScheduleMonth
    ? await getScheduleMonth(selectedScheduleMonth.id)
    : null;

  const slotRuleDayOffTypes =
    dayOffTypes?.filter((dayOffType) => dayOffType.usesSlot) ?? [];

  const calendarSlotDayOffTypes =
    dayOffTypes?.filter(
      (dayOffType) =>
        dayOffType.usesSlot ||
        scheduleMonth?.scheduleDays.some((scheduleDay) =>
          scheduleDay.dayOffSlots.some(
            (dayOffSlot) => dayOffSlot.dayOffTypeId === dayOffType.id,
          ),
        ),
    ) ?? [];

  return (
    <div className="space-y-5">
      <DayOffSlotRuleSettingsCard
        dayOffTypes={slotRuleDayOffTypes}
        dayOffSlotRules={dayOffSlotRules ?? []}
      />

      <DayOffSlotCalendarCard
        dayOffTypes={calendarSlotDayOffTypes}
        scheduleMonths={scheduleMonthList}
        scheduleMonth={scheduleMonth}
        selectedScheduleMonthId={selectedScheduleMonth?.id ?? null}
      />
    </div>
  );
}

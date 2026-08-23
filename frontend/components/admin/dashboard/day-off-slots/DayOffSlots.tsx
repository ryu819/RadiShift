import { DayOffSlotCalendarCard } from "@/components/admin/dashboard/day-off-slots/calendar/DayOffSlotCalendarCard";
import { DayOffSlotRuleSettingsCard } from "@/components/admin/dashboard/day-off-slots/rules/DayOffSlotRuleSettingsCard";
import { getDayOffSlotRules } from "@/lib/actions/get-day-off-slot-rules";
import { getDayOffTypes } from "@/lib/actions/get-day-off-types";
import { getScheduleMonth } from "@/lib/actions/get-schedule-month";
import { getScheduleMonths } from "@/lib/actions/get-schedule-months";

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

  const [dayOffTypes, dayOffSlotRules, scheduleMonths] = await Promise.all([
    getDayOffTypes(),
    getDayOffSlotRules(),
    getScheduleMonths(),
  ]);

  const slotDayOffTypes =
    dayOffTypes?.filter((dayOffType) => dayOffType.usesSlot) ?? [];

  const scheduleMonthList = scheduleMonths ?? [];

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

  const scheduleMonth = selectedScheduleMonth
    ? await getScheduleMonth(selectedScheduleMonth.id)
    : null;

  return (
    <div className="space-y-5">
      <DayOffSlotRuleSettingsCard
        dayOffTypes={slotDayOffTypes}
        dayOffSlotRules={dayOffSlotRules ?? []}
      />

      <DayOffSlotCalendarCard
        dayOffTypes={slotDayOffTypes}
        scheduleMonths={scheduleMonthList}
        scheduleMonth={scheduleMonth}
        selectedScheduleMonthId={selectedScheduleMonth?.id ?? null}
      />
    </div>
  );
}

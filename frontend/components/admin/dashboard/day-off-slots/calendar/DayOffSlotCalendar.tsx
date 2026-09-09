"use client";

import { calendarWeekdays } from "@/components/admin/dashboard/day-off-slots/calendar/day-off-slot-calendar-week-days";
import { DayOffSlotDialogForm } from "@/components/admin/dashboard/day-off-slots/calendar/DayOffSlotDialogForm";
import { APP_TIME_ZONE } from "@/constants/time-zone";
import { dayjs } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import type { DayOffType } from "@/types/day-off-type";
import type { ScheduleDay } from "@/types/schedule-day";

type Props = {
  scheduleDays: ScheduleDay[];
  selectedDayOffType: DayOffType | null;
  selectedScheduleMonthId: number;
};

export function DayOffSlotCalendar({
  scheduleDays,
  selectedDayOffType,
  selectedScheduleMonthId,
}: Props) {
  const firstWeekday = dayjs.tz(scheduleDays[0].date, APP_TIME_ZONE).day();

  const calendarCells: (ScheduleDay | null)[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    calendarCells.push(null);
  }

  for (const day of scheduleDays) {
    calendarCells.push(day);
  }

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  return (
    <>
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {calendarWeekdays.map((weekday, index) => (
          <div
            key={weekday.label}
            className={cn(
              "py-2 text-center text-xs font-medium text-muted-foreground",
              weekday.className,
              index !== 6 && "border-r",
            )}
          >
            {weekday.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarCells.map((day, index) => {
          const isLastColumn = index % 7 === 6;
          const isLastRow = index >= calendarCells.length - 7;

          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className={cn(
                  "min-h-20 bg-muted/20 sm:min-h-24",
                  !isLastColumn && "border-r",
                  !isLastRow && "border-b",
                )}
              />
            );
          }

          const dayOffSlot = day.dayOffSlots.find(
            (dayOffSlot) => dayOffSlot.dayOffTypeId === selectedDayOffType?.id,
          );

          const dateClassName =
            day.isHoliday || day.isSunday
              ? "text-red-500 "
              : day.isSaturday
                ? "text-blue-500 "
                : "";

          return (
            <DayOffSlotDialogForm
              key={day.id}
              scheduleDay={day}
              dayOffType={selectedDayOffType}
              dayOffSlot={dayOffSlot}
              isLastColumn={isLastColumn}
              isLastRow={isLastRow}
              dateClassName={dateClassName}
              selectedScheduleMonthId={selectedScheduleMonthId}
            />
          );
        })}
      </div>
    </>
  );
}

"use client";

import { calendarWeekdays } from "@/components/admin/dashboard/day-off-slots/calendar/day-off-slot-calendar-week-days";
import { ShiftDisplayToggles } from "@/components/master-shift/ShiftDisplayToggles";
import { ShiftRequestDialog } from "@/components/my-shifts/ShiftRequestDialog";
import { Card } from "@/components/ui/card";
import { APP_TIME_ZONE } from "@/constants/time-zone";
import { useShiftDisplayVisibility } from "@/hooks/use-shift-display-visibility";
import { dayjs } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import type { DayOffAssignment } from "@/types/day-off-assignment";
import type { DayOffType } from "@/types/day-off-type";
import type { ModalityAssignment } from "@/types/modality-assignment";
import type { ScheduleDay } from "@/types/schedule-day";
import { ScheduleMonth } from "@/types/schedule-month";
import type { WorkAssignment } from "@/types/work-assignment";
import type { WorkType } from "@/types/work-type";

type Props = {
  scheduleMonth: ScheduleMonth;
  dayOffTypes: DayOffType[];
  workTypes: WorkType[];
  dayOffAssignments: DayOffAssignment[];
  workAssignments: WorkAssignment[];
  modalityAssignments: ModalityAssignment[];
};

export function MyShiftsCalendar({
  scheduleMonth,
  dayOffAssignments,
  workAssignments,
  modalityAssignments,
  dayOffTypes,
  workTypes,
}: Props) {
  const { visibility, updateVisibility } = useShiftDisplayVisibility();

  const firstWeekday = dayjs
    .tz(scheduleMonth.scheduleDays[0].date, APP_TIME_ZONE)
    .day();

  const calendarCells: (ScheduleDay | null)[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    calendarCells.push(null);
  }

  for (const day of scheduleMonth.scheduleDays) {
    calendarCells.push(day);
  }

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  return (
    <div className="space-y-4">
      <ShiftDisplayToggles
        visibility={visibility}
        onChange={updateVisibility}
      />
      <Card className="gap-0 py-0 shadow-none">
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
          {calendarCells.map((scheduleDay, index) => {
            const isLastColumn = index % 7 === 6;
            const isLastRow = index >= calendarCells.length - 7;

            if (!scheduleDay) {
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

            const cellWorkAssignments = workAssignments.filter(
              (workAssignment) =>
                workAssignment.scheduleDayId === scheduleDay.id,
            );

            const cellDayOffAssignments = dayOffAssignments.filter(
              (dayOffAssignment) =>
                dayOffAssignment.scheduleDayId === scheduleDay.id,
            );

            const cellModalityAssignments = modalityAssignments.filter(
              (modalityAssignment) =>
                modalityAssignment.scheduleDayId === scheduleDay.id,
            );

            return (
              <ShiftRequestDialog
                key={scheduleDay.id}
                scheduleDay={scheduleDay}
                scheduleMonth={scheduleMonth}
                dayOffTypes={dayOffTypes}
                workTypes={workTypes}
                dayOffAssignments={cellDayOffAssignments}
                workAssignments={cellWorkAssignments}
                modalityAssignments={cellModalityAssignments}
                shiftDisplayVisibility={visibility}
                isLastColumn={isLastColumn}
                isLastRow={isLastRow}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
}

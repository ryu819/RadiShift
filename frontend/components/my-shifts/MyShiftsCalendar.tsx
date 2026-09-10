import { calendarWeekdays } from "@/components/admin/dashboard/day-off-slots/calendar/day-off-slot-calendar-week-days";
import { ShiftRequestDialog } from "@/components/my-shifts/ShiftRequestDialog";
import { Card } from "@/components/ui/card";
import { APP_TIME_ZONE } from "@/constants/time-zone";
import { dayjs } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import type { DayOffAssignment } from "@/types/day-off-assignment";
import type { DayOffType } from "@/types/day-off-type";
import type { ScheduleDay } from "@/types/schedule-day";
import type { WorkAssignment } from "@/types/work-assignment";
import type { WorkType } from "@/types/work-type";

type Props = {
  scheduleDays: ScheduleDay[];
  selectedScheduleMonthId: number;
  dayOffTypes: DayOffType[];
  workTypes: WorkType[];
  dayOffAssignment: DayOffAssignment[];
  workAssignments: WorkAssignment[];
};

export function MyShiftsCalendar({
  scheduleDays,
  selectedScheduleMonthId,
  dayOffAssignment,
  workAssignments,
  dayOffTypes,
  workTypes,
}: Props) {
  if (scheduleDays.length === 0) {
    return (
      <Card className="flex min-h-72 items-center justify-center shadow-none">
        <p className="text-sm text-muted-foreground">
          表示できる日付がありません。
        </p>
      </Card>
    );
  }

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
            (workAssignment) => workAssignment.scheduleDayId === scheduleDay.id,
          );

          const cellDayOffAssignments = dayOffAssignment.filter(
            (dayOffAssignment) =>
              dayOffAssignment.scheduleDayId === scheduleDay.id,
          );

          return (
            <ShiftRequestDialog
              key={scheduleDay.id}
              scheduleDay={scheduleDay}
              scheduleMonthId={selectedScheduleMonthId}
              dayOffTypes={dayOffTypes}
              workTypes={workTypes}
              dayOffAssignments={cellDayOffAssignments}
              workAssignments={cellWorkAssignments}
              isLastColumn={isLastColumn}
              isLastRow={isLastRow}
            />
          );
        })}
      </div>
    </Card>
  );
}

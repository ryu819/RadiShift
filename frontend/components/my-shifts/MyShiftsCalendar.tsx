"use client";

import { MousePointerClick } from "lucide-react";
import { useState } from "react";

import { calendarWeekdays } from "@/components/admin/dashboard/day-off-slots/calendar/day-off-slot-calendar-week-days";
import { ShiftDisplayToggles } from "@/components/master-shift/ShiftDisplayToggles";
import { BulkShiftRequestDialog } from "@/components/my-shifts/BulkShiftRequestDialog";
import { ShiftRequestDialog } from "@/components/my-shifts/ShiftRequestDialog";
import { Button } from "@/components/ui/button";
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
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedDayIds, setSelectedDayIds] = useState<number[]>([]);
  const selectedDays = scheduleMonth.scheduleDays.filter((day) =>
    selectedDayIds.includes(day.id),
  );

  const exitBulkMode = () => {
    setSelectedDayIds([]);
    setIsBulkMode(false);
  };

  const toggleSelect = (dayId: number) => {
    setSelectedDayIds((ids) =>
      ids.includes(dayId) ? ids.filter((id) => id !== dayId) : [...ids, dayId],
    );
  };

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <ShiftDisplayToggles
          visibility={visibility}
          onChange={updateVisibility}
        />
        <div className="flex h-8 min-w-0 items-center justify-end gap-2">
          {isBulkMode ? (
            <>
              <Button
                type="button"
                key="cancel"
                variant="secondaryOutline"
                size="sm"
                onClick={exitBulkMode}
              >
                キャンセル
              </Button>
              <BulkShiftRequestDialog
                key={scheduleMonth.id}
                scheduleMonthId={scheduleMonth.id}
                selectedDays={selectedDays}
                dayOffTypes={dayOffTypes}
                workTypes={workTypes}
                onComplete={exitBulkMode}
              />
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkMode(true)}
            >
              複数日を選択
            </Button>
          )}
        </div>
      </div>
      {isBulkMode && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm"
        >
          <MousePointerClick
            className="size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            {selectedDays.length === 0 ? (
              "申請する日を選択してください"
            ) : (
              <span>{selectedDays.length}日選択中</span>
            )}
          </div>
        </div>
      )}
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
                isBulkMode={isBulkMode}
                isBulkSelected={selectedDayIds.includes(scheduleDay.id)}
                onToggleBulkSelect={() => toggleSelect(scheduleDay.id)}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
}

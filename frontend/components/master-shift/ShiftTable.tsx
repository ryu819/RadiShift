"use client";

import { LockKeyhole } from "lucide-react";
import { useState } from "react";

import { DayOffTypeItem } from "@/components/master-shift/DayOffTypeItem";
import { WorkTypeItem } from "@/components/master-shift/WorkTypeItem";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { DayOffAssignmentsByUserAndDay } from "@/types/day-off-assignment";
import type { DayOffType } from "@/types/day-off-type";
import type { Member } from "@/types/member";
import type { ScheduleDay } from "@/types/schedule-day";
import type { WorkAssignmentsByUserAndDay } from "@/types/work-assignment";
import type { WorkType } from "@/types/work-type";
import { badgeStyle } from "@/utils/badge-style";

type Props = {
  members: Member[];
  workTypes: WorkType[];
  dayOffTypes: DayOffType[];
  workAssignmentsByUserAndDay: WorkAssignmentsByUserAndDay;
  dayOffAssignmentsByUserAndDay: DayOffAssignmentsByUserAndDay;
  days: ScheduleDay[];
  year: number;
  month: number;
  isEditable: boolean;
};

const getCellKey = (memberId: number, date: string) => {
  return `${memberId}-${date}`;
};

export function ShiftTable({
  members,
  workTypes,
  dayOffTypes,
  workAssignmentsByUserAndDay,
  dayOffAssignmentsByUserAndDay,
  days,
  year,
  month,
  isEditable,
}: Props) {
  const [openCellKey, setOpenCellKey] = useState<string | null>(null);

  const activeWorkTypeIds = workTypes.map((workType) => workType.id);

  const activeDayOffTypeIds = dayOffTypes.map((dayOffType) => dayOffType.id);

  return (
    <div
      className=" flex-1 overflow-auto overscroll-none rounded-sm border border-slate-200 bg-white shadow-sm"
      onScroll={() => setOpenCellKey(null)}
    >
      <table className="w-max min-w-full border-collapse text-xs md:text-sm">
        <thead className="sticky top-0 z-20">
          <tr>
            <th className="sticky left-0 z-30  border-r border-b border-slate-200 bg-slate-50 p-0.5 text-center text-xs font-semibold md:p-1 md:text-sm">
              スタッフ
            </th>

            {days.map((day) => (
              <th
                key={day.date}
                className="w-10 min-w-10 border-r border-b border-slate-200 bg-slate-50 p-0.5 text-center last:border-r-0 md:w-14 md:min-w-14 md:p-1"
              >
                <div
                  className={cn(
                    "text-xs font-bold leading-none md:text-sm",
                    day.isSunday && "text-red-500",
                    day.isSaturday && "text-blue-500",
                  )}
                >
                  {day.day}
                </div>

                <div
                  className={cn(
                    "mt-0.5 text-[9px] font-medium md:mt-1 md:text-[10px]",
                    day.isSunday && "text-red-500",
                    day.isSaturday && "text-blue-500",
                  )}
                >
                  {day.weekdayLabel}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {members.map((member, rowIndex) => (
            <tr key={member.id}>
              <th
                className={cn(
                  "sticky left-0 z-10 border-r border-b border-slate-200 p-0.5 text-center text-xs font-medium md:p-1 md:text-sm",
                  rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50",
                )}
              >
                <span className="block truncate">{member.name}</span>
              </th>

              {days.map((day) => {
                const cellKey = getCellKey(member.id, day.date);

                const cellWorkAssignments =
                  workAssignmentsByUserAndDay?.[String(member.id)]?.[
                    String(day.id)
                  ] ?? [];

                const cellDayOffAssignments =
                  dayOffAssignmentsByUserAndDay?.[String(member.id)]?.[
                    String(day.id)
                  ] ?? [];

                const inactiveWorkAssignments = cellWorkAssignments.filter(
                  (workAssignment) =>
                    !activeWorkTypeIds.includes(workAssignment.workType.id),
                );

                const inactiveDayOffAssignments = cellDayOffAssignments.filter(
                  (dayOffAssignment) =>
                    !activeDayOffTypeIds.includes(
                      dayOffAssignment.dayOffType.id,
                    ),
                );

                const assignmentBadges = (
                  <div className="flex flex-col items-center gap-0.5 md:gap-1">
                    {cellWorkAssignments.map((workAssignment) =>
                      isEditable && workAssignment.workRequestId != null ? (
                        <Tooltip key={workAssignment.id}>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="h-[14px] gap-0 rounded px-1 py-0 text-[10px] font-semibold leading-none md:rounded-md md:px-1.5 md:py-0.5"
                              style={badgeStyle(
                                workAssignment.workType.colorCode,
                              )}
                            >
                              <LockKeyhole className="size-2.5" />

                              <span className="md:hidden">
                                {workAssignment.workType.name.slice(0, 1)}
                              </span>

                              <span className="hidden md:inline">
                                {workAssignment.workType.name}
                              </span>
                            </Badge>
                          </TooltipTrigger>

                          <TooltipContent className="px-2 py-1.5 text-[10px]">
                            <p>本人申請の割当</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Badge
                          key={workAssignment.id}
                          variant="outline"
                          className="h-[14px] rounded px-1 py-0 text-[10px] font-semibold leading-none md:rounded-md md:px-1.5 md:py-0.5"
                          style={badgeStyle(workAssignment.workType.colorCode)}
                        >
                          <span className="md:hidden">
                            {workAssignment.workType.name.slice(0, 1)}
                          </span>

                          <span className="hidden md:inline">
                            {workAssignment.workType.name}
                          </span>
                        </Badge>
                      ),
                    )}

                    {cellDayOffAssignments.map((dayOffAssignment) =>
                      isEditable && dayOffAssignment.dayOffRequestId != null ? (
                        <Tooltip key={dayOffAssignment.id}>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="h-[14px] gap-0 rounded px-1 py-0 text-[10px] font-semibold leading-none md:rounded-md md:px-1.5 md:py-0.5"
                              style={badgeStyle(
                                dayOffAssignment.dayOffType.colorCode,
                              )}
                            >
                              <LockKeyhole className="size-2.5" />

                              <span className="md:hidden">
                                {dayOffAssignment.dayOffType.name.slice(0, 1)}
                              </span>

                              <span className="hidden md:inline">
                                {dayOffAssignment.dayOffType.name}
                              </span>
                            </Badge>
                          </TooltipTrigger>

                          <TooltipContent className="px-2 py-1.5 text-[10px]">
                            <p>本人申請の割当</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Badge
                          key={dayOffAssignment.id}
                          variant="outline"
                          className="h-[14px] gap-0 rounded px-1 py-0 text-[10px] font-semibold leading-none md:rounded-md md:px-1.5 md:py-0.5"
                          style={badgeStyle(
                            dayOffAssignment.dayOffType.colorCode,
                          )}
                        >
                          <span className="md:hidden">
                            {dayOffAssignment.dayOffType.name.slice(0, 1)}
                          </span>

                          <span className="hidden md:inline">
                            {dayOffAssignment.dayOffType.name}
                          </span>
                        </Badge>
                      ),
                    )}
                  </div>
                );

                return (
                  <td
                    key={cellKey}
                    className={cn(
                      "h-10 w-10 border-r border-b border-slate-200 p-0 last:border-r-0 md:h-14 md:w-14",
                      rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50",
                    )}
                  >
                    {isEditable ? (
                      <Popover
                        open={openCellKey === cellKey}
                        onOpenChange={(open) =>
                          setOpenCellKey(open ? cellKey : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex h-full w-full cursor-pointer items-center justify-center p-0.5 transition hover:bg-blue-50 active:bg-blue-50 md:p-1"
                          >
                            {assignmentBadges}
                          </button>
                        </PopoverTrigger>

                        <PopoverContent
                          side="bottom"
                          align="center"
                          sideOffset={6}
                          hideWhenDetached
                          className="w-45 rounded-md border-slate-200 p-3 shadow-lg"
                        >
                          <div className="p-1">
                            <p className="text-sm font-medium text-secondary">
                              {member.name}
                            </p>

                            <p className="mt-1 text-xs text-secondary">
                              {`${year}年 ${month}月`}
                              {day.day}日
                            </p>
                          </div>

                          <div className="mt-1 space-y-1">
                            <p className="px-1 text-xs font-medium text-muted-foreground">
                              勤務
                            </p>

                            <div>
                              {workTypes.map((workType) => {
                                const selectedWorkAssignment =
                                  cellWorkAssignments.find(
                                    (workAssignment) =>
                                      workAssignment.workType.id ===
                                      workType.id,
                                  );

                                return (
                                  <WorkTypeItem
                                    key={workType.id}
                                    workType={workType}
                                    selectedWorkAssignment={
                                      selectedWorkAssignment
                                    }
                                    scheduleDayId={day.id}
                                    userId={member.id}
                                    memberName={member.name}
                                    year={year}
                                    month={month}
                                    day={day.day}
                                  />
                                );
                              })}

                              {inactiveWorkAssignments.map((workAssignment) => (
                                <WorkTypeItem
                                  key={workAssignment.id}
                                  workType={workAssignment.workType}
                                  selectedWorkAssignment={workAssignment}
                                  scheduleDayId={day.id}
                                  userId={member.id}
                                  memberName={member.name}
                                  year={year}
                                  month={month}
                                  day={day.day}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="my-1 border-t" />

                          <div className="space-y-1">
                            <p className="px-1 text-xs font-medium text-muted-foreground">
                              休み
                            </p>

                            <div>
                              {dayOffTypes.map((dayOffType) => {
                                const selectedDayOffAssignment =
                                  cellDayOffAssignments.find(
                                    (dayOffAssignment) =>
                                      dayOffAssignment.dayOffType.id ===
                                      dayOffType.id,
                                  );

                                return (
                                  <DayOffTypeItem
                                    key={dayOffType.id}
                                    dayOffType={dayOffType}
                                    selectedDayOffAssignment={
                                      selectedDayOffAssignment
                                    }
                                    scheduleDayId={day.id}
                                    userId={member.id}
                                    memberName={member.name}
                                    year={year}
                                    month={month}
                                    day={day.day}
                                  />
                                );
                              })}

                              {inactiveDayOffAssignments.map(
                                (dayOffAssignment) => (
                                  <DayOffTypeItem
                                    key={dayOffAssignment.id}
                                    dayOffType={dayOffAssignment.dayOffType}
                                    selectedDayOffAssignment={dayOffAssignment}
                                    scheduleDayId={day.id}
                                    userId={member.id}
                                    memberName={member.name}
                                    year={year}
                                    month={month}
                                    day={day.day}
                                  />
                                ),
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-0.5 md:p-1">
                        {assignmentBadges}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

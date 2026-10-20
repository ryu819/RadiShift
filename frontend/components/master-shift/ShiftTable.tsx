"use client";

import { LockKeyhole } from "lucide-react";
import { useState } from "react";

import { DayOffTypeItem } from "@/components/master-shift/DayOffTypeItem";
import { ExitFullscreenButton } from "@/components/master-shift/ExitFullscreenButton";
import { MasterShiftPrintButton } from "@/components/master-shift/MasterShiftPrintButton";
import { ModalityTypeItem } from "@/components/master-shift/ModalityTypeItem";
import { ShiftDisplayToggles } from "@/components/master-shift/ShiftDisplayToggles";
import { StartFullscreenButton } from "@/components/master-shift/StartFullscreenButton";
import { WorkTypeItem } from "@/components/master-shift/WorkTypeItem";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { APP_TIME_ZONE } from "@/constants/time-zone";
import { useShiftDisplayVisibility } from "@/hooks/use-shift-display-visibility";
import { dayjs } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import type { DayOffAssignmentsByUserAndDay } from "@/types/day-off-assignment";
import type { DayOffType } from "@/types/day-off-type";
import type { Member } from "@/types/member";
import type { ModalityAssignmentsByUserAndDay } from "@/types/modality-assignment";
import type { ModalityType } from "@/types/modality-type";
import type { ScheduleDay } from "@/types/schedule-day";
import type { WorkAssignmentsByUserAndDay } from "@/types/work-assignment";
import type { WorkType } from "@/types/work-type";
import { badgeStyle } from "@/utils/badge-style";

type Props = {
  members: Member[];
  workTypes: WorkType[];
  dayOffTypes: DayOffType[];
  modalityTypes: ModalityType[];
  workAssignmentsByUserAndDay: WorkAssignmentsByUserAndDay;
  dayOffAssignmentsByUserAndDay: DayOffAssignmentsByUserAndDay;
  modalityAssignmentsByUserAndDay: ModalityAssignmentsByUserAndDay;
  days: ScheduleDay[];
  year: number;
  month: number;
  isAdmin: boolean;
};

const getCellKey = (memberId: number, date: string) => {
  return `${memberId}-${date}`;
};

export function ShiftTable({
  members,
  workTypes,
  dayOffTypes,
  modalityTypes,
  workAssignmentsByUserAndDay,
  dayOffAssignmentsByUserAndDay,
  modalityAssignmentsByUserAndDay,
  days,
  year,
  month,
  isAdmin,
}: Props) {
  const [openCellKey, setOpenCellKey] = useState<string | null>(null);

  const [selectedEditTab, setSelectedEditTab] = useState("work");

  const { visibility, updateVisibility } = useShiftDisplayVisibility();

  const activeWorkTypeIds = workTypes.map((workType) => workType.id);

  const activeDayOffTypeIds = dayOffTypes.map((dayOffType) => dayOffType.id);

  const activeModalityTypeIds = modalityTypes.map(
    (modalityType) => modalityType.id,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 landscape:max-lg:gap-1  master-shift-fullscreen-frame">
      <div className="flex justify-between items-center master-shift-print-hide">
        <ShiftDisplayToggles
          visibility={visibility}
          onChange={updateVisibility}
        />

        <div className="flex items-center gap-2 master-shift-fullscreen-hide">
          <MasterShiftPrintButton />
          <StartFullscreenButton />
        </div>
        <ExitFullscreenButton />
      </div>

      <h1 className="master-shift-print-area master-shift-print-only hidden text-center text-3xl font-semibold mb-4">
        {year}年{month}月
      </h1>
      <div
        className="overflow-auto overscroll-none rounded-sm border border-slate-200 bg-white shadow-sm master-shift-print-area "
        onScroll={() => setOpenCellKey(null)}
      >
        <table className="w-max min-w-full border-collapse text-xs md:text-sm">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="sticky left-0 z-30  border-r border-b border-slate-200 bg-slate-50 p-0.5 text-center text-xs font-semibold md:p-1 md:text-sm print:w-px print:whitespace-nowrap">
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
                    rowIndex === members.length - 1 && "border-b-0",
                  )}
                >
                  <span className="block truncate">{member.name}</span>
                </th>

                {days.map((day) => {
                  const cellKey = getCellKey(member.id, day.date);

                  const isPast = dayjs
                    .tz(day.date, APP_TIME_ZONE)
                    .isBefore(dayjs().tz(APP_TIME_ZONE), "day");

                  const canEditCell = isAdmin && !isPast;

                  const cellWorkAssignments =
                    workAssignmentsByUserAndDay?.[String(member.id)]?.[
                      String(day.id)
                    ] ?? [];

                  const cellDayOffAssignments =
                    dayOffAssignmentsByUserAndDay?.[String(member.id)]?.[
                      String(day.id)
                    ] ?? [];

                  const cellModalityAssignments =
                    modalityAssignmentsByUserAndDay?.[String(member.id)]?.[
                      String(day.id)
                    ] ?? [];

                  const inactiveWorkAssignments = cellWorkAssignments.filter(
                    (workAssignment) =>
                      !activeWorkTypeIds.includes(workAssignment.workType.id),
                  );

                  const inactiveDayOffAssignments =
                    cellDayOffAssignments.filter(
                      (dayOffAssignment) =>
                        !activeDayOffTypeIds.includes(
                          dayOffAssignment.dayOffType.id,
                        ),
                    );

                  const inactiveModalityAssignments =
                    cellModalityAssignments.filter(
                      (modalityAssignment) =>
                        !activeModalityTypeIds.includes(
                          modalityAssignment.modalityType.id,
                        ),
                    );

                  const assignmentBadges = (
                    <div className="flex flex-col w-11 items-center gap-0.5 md:gap-1">
                      {visibility.work &&
                        cellWorkAssignments.map((workAssignment) =>
                          isAdmin && workAssignment.workRequestId != null ? (
                            <Tooltip key={workAssignment.id}>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="h-[14px] max-w-full gap-0 rounded-md px-1 py-0 text-[9px] md:text-[10px]  font-semibold leading-none md:px-1 md:py-0.5"
                                  style={badgeStyle(
                                    workAssignment.workType.colorCode,
                                  )}
                                >
                                  <LockKeyhole className="size-2.5 master-shift-print-hide" />

                                  <span className="overflow-hidden">
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
                              className="h-[14px] max-w-full rounded-md px-1 py-0 text-[9px] md:text-[10px] font-semibold leading-none  md:px-1.5 md:py-0.5"
                              style={badgeStyle(
                                workAssignment.workType.colorCode,
                              )}
                            >
                              <span className="overflow-hidden">
                                {workAssignment.workType.name}
                              </span>
                            </Badge>
                          ),
                        )}

                      {visibility.dayOff &&
                        cellDayOffAssignments.map((dayOffAssignment) =>
                          isAdmin &&
                          dayOffAssignment.dayOffRequestId != null ? (
                            <Tooltip key={dayOffAssignment.id}>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="h-[14px] max-w-full gap-0 rounded-md px-1 py-0 text-[9px] md:text-[10px]  font-semibold leading-none md:px-1 md:py-0.5"
                                  style={badgeStyle(
                                    dayOffAssignment.dayOffType.colorCode,
                                  )}
                                >
                                  <LockKeyhole className="size-2.5 master-shift-print-hide" />

                                  <span className="overflow-hidden">
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
                              className="h-[14px] max-w-full gap-0 rounded-md px-1 py-0 text-[9px] md:text-[10px]  font-semibold leading-none md:px-1.5 md:py-0.5"
                              style={badgeStyle(
                                dayOffAssignment.dayOffType.colorCode,
                              )}
                            >
                              <span className="overflow-hidden">
                                {dayOffAssignment.dayOffType.name}
                              </span>
                            </Badge>
                          ),
                        )}

                      {visibility.modality &&
                        cellModalityAssignments.map((modalityAssignment) => (
                          <Badge
                            key={modalityAssignment.id}
                            variant="outline"
                            className="h-[14px] max-w-full  gap-0 rounded-md px-1 py-0 text-[9px] md:text-[10px]   font-semibold leading-none  md:px-1.5 md:py-0.5"
                            style={badgeStyle(
                              modalityAssignment.modalityType.colorCode,
                            )}
                          >
                            <span className="overflow-hidden">
                              {modalityAssignment.modalityType.name}
                            </span>
                          </Badge>
                        ))}
                    </div>
                  );

                  return (
                    <td
                      key={cellKey}
                      className={cn(
                        "h-13 w-13 border-r border-b border-slate-200 p-0 last:border-r-0 md:h-15 md:max-w-15",
                        rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50",
                        rowIndex === members.length - 1 && "border-b-0",
                      )}
                    >
                      {canEditCell ? (
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
                            collisionPadding={8}
                            hideWhenDetached
                            className="max-h-70 md:max-h-100 w-60  rounded-md border-slate-200 p-3 shadow-lg master-shift-print-hide"
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

                            <Tabs
                              value={selectedEditTab}
                              onValueChange={setSelectedEditTab}
                              className="min-h-0"
                            >
                              <TabsList className="grid  grid-cols-3 w-full">
                                <TabsTrigger
                                  value="work"
                                  className="text-xs cursor-pointer"
                                >
                                  勤務
                                </TabsTrigger>
                                <TabsTrigger
                                  value="dayOff"
                                  className="text-xs cursor-pointer"
                                >
                                  休み
                                </TabsTrigger>
                                <TabsTrigger
                                  value="modality"
                                  className="text-xs cursor-pointer"
                                >
                                  モダリティ
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent
                                value="work"
                                className="overflow-y-auto"
                              >
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

                                  {inactiveWorkAssignments.map(
                                    (workAssignment) => (
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
                                    ),
                                  )}
                                </div>
                              </TabsContent>

                              <TabsContent
                                value="dayOff"
                                className="overflow-y-auto"
                              >
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
                                        selectedDayOffAssignment={
                                          dayOffAssignment
                                        }
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
                              </TabsContent>

                              <TabsContent
                                value="modality"
                                className="overflow-y-auto"
                              >
                                <div>
                                  {modalityTypes.map((modalityType) => {
                                    const selectedModalityAssignment =
                                      cellModalityAssignments.find(
                                        (modalityAssignment) =>
                                          modalityAssignment.modalityType.id ===
                                          modalityType.id,
                                      );

                                    return (
                                      <ModalityTypeItem
                                        key={modalityType.id}
                                        modalityType={modalityType}
                                        selectedModalityAssignment={
                                          selectedModalityAssignment
                                        }
                                        scheduleDayId={day.id}
                                        userId={member.id}
                                      />
                                    );
                                  })}

                                  {inactiveModalityAssignments.map(
                                    (modalityAssignment) => (
                                      <ModalityTypeItem
                                        key={modalityAssignment.id}
                                        modalityType={
                                          modalityAssignment.modalityType
                                        }
                                        selectedModalityAssignment={
                                          modalityAssignment
                                        }
                                        scheduleDayId={day.id}
                                        userId={member.id}
                                      />
                                    ),
                                  )}
                                </div>
                              </TabsContent>
                            </Tabs>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <div
                          className={cn(
                            "flex h-full w-full items-center justify-center p-0.5 md:p-1",
                            isPast && isAdmin && "cursor-not-allowed",
                          )}
                        >
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
    </div>
  );
}

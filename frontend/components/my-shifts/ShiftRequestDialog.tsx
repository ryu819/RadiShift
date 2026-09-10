"use client";

import { Loader2, RotateCcw } from "lucide-react";
import { startTransition, useActionState, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { APP_TIME_ZONE } from "@/constants/time-zone";
import {
  type ActionState,
  createDayOffRequestForm,
} from "@/lib/actions/requests/create-day-off-request";
import { createWorkRequestForm } from "@/lib/actions/requests/create-work-request";
import { dayjs } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import type { DayOffAssignment } from "@/types/day-off-assignment";
import type { DayOffType } from "@/types/day-off-type";
import type { ScheduleDay } from "@/types/schedule-day";
import { WorkAssignment } from "@/types/work-assignment";
import { WorkType } from "@/types/work-type";
import { badgeStyle } from "@/utils/badge-style";

type Props = {
  scheduleDay: ScheduleDay;
  scheduleMonthId: number;
  dayOffTypes: DayOffType[];
  workTypes: WorkType[];
  dayOffAssignments: DayOffAssignment[];
  workAssignments: WorkAssignment[];
  isLastColumn: boolean;
  isLastRow: boolean;
};

type SelectedRequest = {
  shiftType: DayOffType | WorkType;
  kind: "work" | "dayOff";
  isReturn: boolean;
};

export function ShiftRequestDialog({
  scheduleDay,
  scheduleMonthId,
  dayOffTypes,
  workTypes,
  dayOffAssignments,
  workAssignments,
  isLastColumn,
  isLastRow,
}: Props) {
  const [open, setOpen] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<SelectedRequest | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState =
        selectedRequest?.kind === "work"
          ? await createWorkRequestForm(prevState, formData)
          : await createDayOffRequestForm(prevState, formData);

      if (nextState.success) {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    {
      success: false,
    },
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setSelectedRequest(null);
    }
  };

  const assignedDayOffTypeIds = dayOffAssignments.map(
    (dayOffAssignment) => dayOffAssignment.dayOffType.id,
  );

  const requestableDayOffTypes = dayOffTypes.filter(
    (dayOffType) => !assignedDayOffTypeIds.includes(dayOffType.id),
  );

  const assignedWorkTypeIds = workAssignments.map(
    (workAssignment) => workAssignment.workType.id,
  );

  const requestableWorkTypes = workTypes.filter(
    (workType) =>
      workType.isRequestable && !assignedWorkTypeIds.includes(workType.id),
  );

  const dateClassName =
    scheduleDay.isHoliday || scheduleDay.isSunday
      ? "text-red-500"
      : scheduleDay.isSaturday
        ? "text-blue-500"
        : "";

  const isPastDay = !dayjs
    .tz(scheduleDay.date, APP_TIME_ZONE)
    .isAfter(dayjs().tz(APP_TIME_ZONE), "day");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={isPastDay}
          className={cn(
            " min-h-20    p-1 sm:p-2 text-left sm:min-h-24",
            !isPastDay &&
              "cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted/50",
            !isLastColumn && "border-r",
            !isLastRow && "border-b",
          )}
        >
          <div className="flex h-full flex-col sm:gap-2">
            <div className="flex items-center justify-between gap-1">
              <span className={cn("text-sm font-medium", dateClassName)}>
                {scheduleDay.day}
              </span>

              {scheduleDay.isHoliday && (
                <span className="text-[9px] sm:text-xs text-red-500">祝</span>
              )}
            </div>

            <div className="space-y-1 my-auto">
              {workAssignments.map((workAssignment) => (
                <Badge
                  key={workAssignment.id}
                  variant="outline"
                  className="m-0 w-full  rounded-md font-semibold"
                  style={badgeStyle(workAssignment.workType.colorCode)}
                >
                  {workAssignment.workType.name}
                </Badge>
              ))}

              {dayOffAssignments.map((dayOffAssignment) => (
                <Badge
                  key={dayOffAssignment.id}
                  variant="outline"
                  className="m-0 w-full  rounded-md font-semibold"
                  style={badgeStyle(dayOffAssignment.dayOffType.colorCode)}
                >
                  {dayOffAssignment.dayOffType.name}
                </Badge>
              ))}
            </div>

            {scheduleDay.dayOffSlots.length > 0 && (
              <div className="mt-auto space-y-0.5 border-t pt-1 max-sm:hidden">
                {scheduleDay.dayOffSlots.map((dayOffSlot) => (
                  <div
                    key={dayOffSlot.id}
                    className="flex items-center justify-between gap-1 text-[11px] "
                  >
                    <span>{dayOffSlot.dayOffType.name}</span>

                    <span>残り{dayOffSlot.remainingSlots}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">シフト申請</DialogTitle>

          <DialogDescription className="text-center">
            {dayjs.tz(scheduleDay.date, APP_TIME_ZONE).format("YYYY年M月D日")}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="scheduleDayId" value={scheduleDay.id} />
          <input type="hidden" name="scheduleMonthId" value={scheduleMonthId} />

          {selectedRequest && (
            <>
              <input
                type="hidden"
                name="shiftTypeId"
                value={selectedRequest.shiftType.id}
              />

              <input
                type="hidden"
                name="isReturn"
                value={String(selectedRequest.isReturn)}
              />
            </>
          )}

          {(workAssignments.length > 0 || dayOffAssignments.length > 0) && (
            <div className="space-y-3">
              <p className="text-sm font-medium">現在の割り当て</p>

              {workAssignments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">勤務</p>

                  {workAssignments.map((workAssignment) => {
                    const workType = workAssignment.workType;

                    const canReturn = workTypes.some(
                      (requestableWorkType) =>
                        requestableWorkType.id === workType.id &&
                        requestableWorkType.isRequestable,
                    );

                    const isSelected =
                      selectedRequest?.kind === "work" &&
                      selectedRequest.shiftType.id === workType.id &&
                      selectedRequest.isReturn;

                    return (
                      <button
                        key={workAssignment.id}
                        type="button"
                        disabled={isPending || !canReturn}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md border p-3 transition-colors",
                          canReturn
                            ? "cursor-pointer hover:bg-muted/50 active:bg-muted/50"
                            : "cursor-not-allowed opacity-60",
                          isSelected && "border-primary bg-muted/50",
                        )}
                        onClick={() =>
                          setSelectedRequest({
                            kind: "work",
                            shiftType: workTypes.find(
                              (item) => item.id === workType.id,
                            )!,
                            isReturn: true,
                          })
                        }
                      >
                        <Badge
                          variant="outline"
                          style={badgeStyle(workType.colorCode)}
                        >
                          {workType.name}
                        </Badge>

                        {canReturn ? (
                          <div className="flex items-center gap-1 text-amber-700">
                            <RotateCcw className="size-3" />

                            <span className="text-xs font-medium">返上</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            返上不可
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {dayOffAssignments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">休み</p>

                  {dayOffAssignments.map((dayOffAssignment) => {
                    const dayOffType = dayOffAssignment.dayOffType;

                    const isSelected =
                      selectedRequest?.kind === "dayOff" &&
                      selectedRequest.shiftType.id === dayOffType.id &&
                      selectedRequest.isReturn;

                    return (
                      <button
                        key={dayOffAssignment.id}
                        type="button"
                        disabled={isPending}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50 active:bg-muted/50",
                          isSelected && "border-primary bg-muted/50",
                        )}
                        onClick={() =>
                          setSelectedRequest({
                            kind: "dayOff",
                            shiftType: dayOffType,
                            isReturn: true,
                          })
                        }
                      >
                        <Badge
                          variant="outline"
                          style={badgeStyle(dayOffType.colorCode)}
                        >
                          {dayOffType.name}
                        </Badge>

                        <div className="flex items-center gap-1 text-amber-700">
                          <RotateCcw className="size-3" />

                          <span className="text-xs font-medium">返上</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {(requestableWorkTypes.length > 0 ||
            requestableDayOffTypes.length > 0) && (
            <div className="space-y-3">
              <p className="text-sm font-medium">新規申請</p>

              {requestableWorkTypes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">勤務</p>

                  {requestableWorkTypes.map((workType) => {
                    const isSelected =
                      selectedRequest?.kind === "work" &&
                      selectedRequest.shiftType.id === workType.id &&
                      !selectedRequest.isReturn;

                    return (
                      <button
                        key={workType.id}
                        type="button"
                        disabled={isPending}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50 active:bg-muted/50",
                          isSelected && "border-primary bg-muted/50",
                        )}
                        onClick={() =>
                          setSelectedRequest({
                            kind: "work",
                            shiftType: workType,
                            isReturn: false,
                          })
                        }
                      >
                        <Badge
                          variant="outline"
                          style={badgeStyle(workType.colorCode)}
                        >
                          {workType.name}
                        </Badge>

                        <span className="text-xs text-muted-foreground">
                          申請可
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {requestableDayOffTypes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">休み</p>

                  {requestableDayOffTypes.map((dayOffType) => {
                    const dayOffSlot = scheduleDay.dayOffSlots.find(
                      (slot) => slot.dayOffTypeId === dayOffType.id,
                    );

                    const isSelected =
                      selectedRequest?.kind === "dayOff" &&
                      selectedRequest.shiftType.id === dayOffType.id &&
                      !selectedRequest.isReturn;

                    return (
                      <button
                        key={dayOffType.id}
                        type="button"
                        disabled={isPending}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50 active:bg-muted/50",
                          isSelected && "border-primary bg-muted/50",
                        )}
                        onClick={() =>
                          setSelectedRequest({
                            kind: "dayOff",
                            shiftType: dayOffType,
                            isReturn: false,
                          })
                        }
                      >
                        <Badge
                          variant="outline"
                          style={badgeStyle(dayOffType.colorCode)}
                        >
                          {dayOffType.name}
                        </Badge>

                        {dayOffType.usesSlot && (
                          <span className="text-xs text-muted-foreground">
                            {dayOffSlot
                              ? `残り${dayOffSlot.remainingSlots}`
                              : "枠未設定"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {workAssignments.length === 0 &&
            dayOffAssignments.length === 0 &&
            requestableWorkTypes.length === 0 &&
            requestableDayOffTypes.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                申請できる勤務・休みはありません
              </p>
            )}

          {state.errors && <p className="text-sm text-red-500">{}</p>}

          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={!selectedRequest || isPending}
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : selectedRequest?.isReturn ? (
                "返上を申請"
              ) : (
                "申請する"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

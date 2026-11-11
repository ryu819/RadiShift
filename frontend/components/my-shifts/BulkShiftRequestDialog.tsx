"use client";

import { CircleCheck, CircleX, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

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
  bulkCreateRequestsForm,
} from "@/lib/actions/requests/bulk-create-requests";
import { dayjs } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import type { DayOffType } from "@/types/day-off-type";
import type { ScheduleDay } from "@/types/schedule-day";
import type { WorkType } from "@/types/work-type";
import { badgeStyle } from "@/utils/badge-style";

type Props = {
  scheduleMonthId: number;
  selectedDays: ScheduleDay[];
  dayOffTypes: DayOffType[];
  workTypes: WorkType[];
  onComplete: () => void;
};

type SelectedRequest = {
  requestKind: "work" | "dayOff";
  shiftType: DayOffType | WorkType;
};

function formatDay(day: ScheduleDay, format: string) {
  return `${dayjs.tz(day.date, APP_TIME_ZONE).format(format)}（${day.weekdayLabel}）`;
}

export function BulkShiftRequestDialog({
  scheduleMonthId,
  selectedDays,
  dayOffTypes,
  workTypes,
  onComplete,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<SelectedRequest | null>(null);
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = await bulkCreateRequestsForm(prevState, formData);
      if (nextState.success) {
        onComplete();
      }
      return nextState;
    },
    { success: false, createdCount: 0, failures: [] },
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return;
    setOpen(nextOpen);
    if (nextOpen) setSelectedRequest(null);
    if (!nextOpen && state.failures.length > 0) onComplete();
  };

  const groups: {
    requestKind: SelectedRequest["requestKind"];
    label: string;
    types: (WorkType | DayOffType)[];
  }[] = [
    {
      requestKind: "work",
      label: "勤務",
      types: workTypes.filter((type) => type.isRequestable),
    },
    { requestKind: "dayOff", label: "休み", types: dayOffTypes },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={selectedDays.length === 0}>
          複数日を申請
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[85dvh] max-w-xs overflow-y-auto sm:max-w-sm"
        showCloseButton={!isPending}
      >
        <DialogHeader>
          {state.failures.length > 0 ? (
            <>
              <DialogTitle className="text-center text-xl">
                申請結果
              </DialogTitle>
              <DialogDescription className="text-center">
                {selectedRequest && (
                  <Badge
                    variant="outline"
                    style={badgeStyle(selectedRequest.shiftType.colorCode)}
                  >
                    {selectedRequest.shiftType.name}
                  </Badge>
                )}{" "}
                を{state.createdCount}日分申請しました
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle className="text-center text-xl">
                複数シフト申請
              </DialogTitle>
              <DialogDescription className="text-center">
                {selectedDays.length}日分の同じ希望を申請します
              </DialogDescription>
            </>
          )}
        </DialogHeader>
        {state.failures.length > 0 ? (
          <div className="space-y-4" role="status">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CircleCheck className="size-4 text-green-600" />
                  申請済み
                </span>
                <span className="font-medium">{state.createdCount}日</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CircleX className="size-4 text-destructive" />
                  申請不可
                </span>
                <span className="font-medium">{state.failures.length}日</span>
              </div>
            </div>
            <ul className="space-y-3">
              {state.failures.map((failure) => {
                const day = selectedDays.find(
                  (day) => day.id === failure.scheduleDayId,
                );
                return (
                  <li key={failure.scheduleDayId} className="p-0.5 space-y-1">
                    <p className="text-sm font-medium">
                      {day && formatDay(day, "M月D日")}
                    </p>
                    <p className="text-xs text-red-500">{failure.reason}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <form action={formAction} className="space-y-5">
            <input
              type="hidden"
              name="scheduleMonthId"
              value={scheduleMonthId}
            />
            {selectedDays.map((day) => (
              <input
                key={day.id}
                type="hidden"
                name="scheduleDayId"
                value={day.id}
              />
            ))}
            {selectedRequest && (
              <>
                <input
                  type="hidden"
                  name="requestKind"
                  value={selectedRequest.requestKind}
                />
                <input
                  type="hidden"
                  name="shiftTypeId"
                  value={selectedRequest.shiftType.id}
                />
              </>
            )}
            <p className="text-sm text-muted-foreground text-center">
              {selectedDays.map((day) => formatDay(day, "M/D")).join("、")}
            </p>
            {groups.map(
              (group) =>
                group.types.length > 0 && (
                  <div key={group.requestKind} className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {group.label}
                    </p>
                    {group.types.map((shiftType) => {
                      const isSelected =
                        selectedRequest?.requestKind === group.requestKind &&
                        selectedRequest.shiftType.id === shiftType.id;
                      return (
                        <button
                          key={shiftType.id}
                          type="button"
                          disabled={isPending}
                          aria-pressed={isSelected}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50 active:bg-muted/50",
                            isSelected && "border-primary bg-muted/50",
                          )}
                          onClick={() =>
                            setSelectedRequest({
                              requestKind: group.requestKind,
                              shiftType,
                            })
                          }
                        >
                          <Badge
                            variant="outline"
                            style={badgeStyle(shiftType.colorCode)}
                          >
                            {shiftType.name}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                ),
            )}
            {groups.every((group) => group.types.length === 0) && (
              <p className="text-sm">申請できる種類がありません。</p>
            )}
            <DialogFooter>
              <Button
                type="submit"
                disabled={!selectedRequest || isPending}
                className="w-full"
              >
                {isPending ? <Loader2 className="animate-spin" /> : "申請する"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

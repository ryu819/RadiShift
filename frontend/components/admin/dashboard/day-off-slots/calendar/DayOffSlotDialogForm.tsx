"use client";

import { Loader2, Minus, Plus } from "lucide-react";
import { startTransition, useActionState, useState } from "react";

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
  ActionState,
  createDayOffSlotForm,
} from "@/lib/actions/day-off-slots/create-day-off-slot";
import { updateDayOffSlotForm } from "@/lib/actions/day-off-slots/update-day-off-slot";
import { dayjs } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import type { DayOffSlot } from "@/types/day-off-slot";
import type { DayOffType } from "@/types/day-off-type";
import type { ScheduleDay } from "@/types/schedule-day";

type Props = {
  scheduleDay: ScheduleDay;
  dayOffType: DayOffType | null;
  dayOffSlot?: DayOffSlot;
  isLastColumn: boolean;
  dateClassName: string;
  selectedScheduleMonthId: number;
};

export function DayOffSlotDialogForm({
  scheduleDay,
  dayOffType,
  dayOffSlot,
  isLastColumn,
  dateClassName,
  selectedScheduleMonthId,
}: Props) {
  const [open, setOpen] = useState(false);

  const [maxSlots, setMaxSlots] = useState(dayOffSlot?.maxSlots ?? 0);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = dayOffSlot
        ? await updateDayOffSlotForm(prevState, formData)
        : await createDayOffSlotForm(prevState, formData);

      if (nextState.success) {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    {
      success: false,
      errors: {},
    },
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setMaxSlots(dayOffSlot?.maxSlots ?? 0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "min-h-20 cursor-pointer border-r border-b p-1 sm:p-2 text-left transition-colors hover:bg-muted/50 active:bg-muted/50 sm:min-h-24",
            isLastColumn && "border-r-0",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-1">
              <span className={cn("text-sm font-medium", dateClassName)}>
                {scheduleDay.day}
              </span>

              {scheduleDay.isHoliday && (
                <span className="text-[9px] sm:text-xs text-red-500">祝</span>
              )}
            </div>

            <p
              className={cn(
                "my-auto text-center text-xs sm:text-sm font-medium ",
                !dayOffSlot && "text-muted-foreground text-[9px] sm:text-sm",
              )}
            >
              {dayOffSlot ? `${dayOffSlot.maxSlots}枠` : "未設定"}
            </p>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {dayjs.tz(scheduleDay.date, APP_TIME_ZONE).format("YYYY年M月D日")}
          </DialogTitle>

          <DialogDescription className="text-center">
            {dayOffType?.name}の枠を変更します
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5">
          {dayOffSlot ? (
            <input type="hidden" name="dayOffSlotId" value={dayOffSlot.id} />
          ) : (
            <>
              <input
                type="hidden"
                name="scheduleDayId"
                value={scheduleDay.id}
              />

              <input type="hidden" name="dayOffTypeId" value={dayOffType?.id} />
            </>
          )}

          <input
            type="hidden"
            name="scheduleMonthId"
            value={selectedScheduleMonthId}
          />

          <input type="hidden" name="maxSlots" value={maxSlots} />

          <div className="rounded-sm bg-muted/50 p-3">
            <div className="flex items-center justify-around">
              <span className="text-sm text-muted-foreground">現在の枠</span>

              <span className="font-medium">
                {dayOffSlot ? `${dayOffSlot.maxSlots}枠` : "未設定"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-center text-sm font-medium">変更後の枠</p>

            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isPending || maxSlots === 0}
                onClick={() => {
                  setMaxSlots((current) => Math.max(0, current - 1));
                }}
              >
                <Minus />
              </Button>

              <span className="w-12 text-center text-2xl font-semibold">
                {maxSlots}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isPending}
                onClick={() => {
                  setMaxSlots((current) => current + 1);
                }}
              >
                <Plus />
              </Button>
            </div>
          </div>

          {state.errors?.maxSlots && (
            <p className="text-sm text-red-500">{state.errors.maxSlots}</p>
          )}

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

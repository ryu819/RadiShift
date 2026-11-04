"use client";

import { Loader2, Minus, Plus, Settings } from "lucide-react";
import { startTransition, useActionState, useState } from "react";

import { dayOffSlotRuleWeekDays } from "@/components/admin/dashboard/day-off-slots/rules/day-off-slot-rule-week-days";
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
import {
  ActionState,
  bulkUpdateDayOffSlotRulesForm,
} from "@/lib/actions/day-off-slots/bulk-update-day-off-slot-rules";
import { cn } from "@/lib/utils";
import type { DayOffSlotRule } from "@/types/day-off-slot-rule";
import type { DayOffType } from "@/types/day-off-type";

type Props = {
  dayOffType: DayOffType;
  dayOffSlotRules: DayOffSlotRule[];
};

export function DayOffSlotRuleDialogForm({
  dayOffType,
  dayOffSlotRules,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="hover:text-primary  active:text-primary transition"
        >
          <Settings />
          設定
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            休み枠ルール
          </DialogTitle>

          <DialogDescription className="text-center">
            「{dayOffType.name}」の枠ルールを設定します
          </DialogDescription>
        </DialogHeader>

        <DayOffSlotRuleFormContent
          dayOffType={dayOffType}
          dayOffSlotRules={dayOffSlotRules}
          onSaved={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function buildInitialMaxSlots(dayOffSlotRules: DayOffSlotRule[]) {
  const result: Record<number, number> = {};

  for (const { weekday } of dayOffSlotRuleWeekDays) {
    const savedRule = dayOffSlotRules.find((rule) => rule.weekday === weekday);

    if (savedRule) {
      result[weekday] = savedRule.maxSlots;
    } else {
      result[weekday] = 0;
    }
  }

  return result;
}

function DayOffSlotRuleFormContent({
  dayOffType,
  dayOffSlotRules,
  onSaved,
}: Props & { onSaved: () => void }) {
  const [maxSlotsByWeekday, setMaxSlotsByWeekday] = useState(() =>
    buildInitialMaxSlots(dayOffSlotRules),
  );

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = await bulkUpdateDayOffSlotRulesForm(
        prevState,
        formData,
      );

      if (nextState.success) {
        startTransition(() => {
          onSaved();
        });
      }

      return nextState;
    },
    {
      success: false,
      errors: {},
    },
  );

  const changeMaxSlots = (weekday: number, diff: number) => {
    setMaxSlotsByWeekday((current) => ({
      ...current,
      [weekday]: Math.max(0, current[weekday] + diff),
    }));
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="dayOffTypeId" value={dayOffType.id} />

      <div className="divide-y">
        {dayOffSlotRuleWeekDays.map(({ weekday, label, className }) => {
          const maxSlots = maxSlotsByWeekday[weekday];
          const rowErrors = state.errors?.[weekday];

          return (
            <div key={weekday} className="py-3 pl-5">
              <input type="hidden" name="weekday" value={weekday} />

              <input type="hidden" name="maxSlots" value={maxSlots} />

              <div className="flex items-center justify-between gap-3">
                <span className={cn("text-sm font-medium", className)}>
                  {label}
                </span>

                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending || maxSlots === 0}
                    onClick={() => changeMaxSlots(weekday, -1)}
                  >
                    <Minus />
                  </Button>

                  <span className="w-8 text-center font-medium">
                    {maxSlots}
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending}
                    onClick={() => changeMaxSlots(weekday, 1)}
                  >
                    <Plus />
                  </Button>
                </div>
              </div>

              {rowErrors && (
                <p className="mt-2 text-sm text-red-500">
                  {rowErrors.join("、")}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <DialogFooter className="mt-4">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : "保存"}
        </Button>
      </DialogFooter>
    </form>
  );
}

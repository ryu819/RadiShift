"use client";

import { Check, Loader2, Minus, Plus } from "lucide-react";
import { startTransition, useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ActionState,
  createDayOffSlotRuleForm,
} from "@/lib/actions/day-off-slots/create-day-off-slot-rule";
import { updateDayOffSlotRuleForm } from "@/lib/actions/day-off-slots/update-day-off-slot-rule";
import { cn } from "@/lib/utils";
import type { DayOffSlotRule } from "@/types/day-off-slot-rule";
import type { DayOffType } from "@/types/day-off-type";

type Props = {
  dayOffType: DayOffType;
  dayRule: DayOffSlotRule | null;
  weekday: number;
  label: string;
  className?: string;
};

export function DayOffSlotRuleForm({
  dayOffType,
  dayRule,
  weekday,
  label,
  className,
}: Props) {
  const [maxSlots, setMaxSlots] = useState(dayRule?.maxSlots ?? 0);

  const [isSaved, setIsSaved] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = dayRule
        ? await updateDayOffSlotRuleForm(prevState, formData)
        : await createDayOffSlotRuleForm(prevState, formData);

      if (nextState.success) {
        startTransition(() => {
          setIsSaved(true);
        });
      }

      return nextState;
    },
    {
      success: false,
      errors: {},
    },
  );

  return (
    <div className="py-3 pl-5">
      <form
        action={formAction}
        className="flex items-center justify-between gap-3"
      >
        {dayRule ? (
          <input type="hidden" name="dayOffSlotRuleId" value={dayRule.id} />
        ) : (
          <>
            <input type="hidden" name="dayOffTypeId" value={dayOffType.id} />

            <input type="hidden" name="weekday" value={weekday} />
          </>
        )}

        <input type="hidden" name="maxSlots" value={maxSlots} />

        <span className={cn("text-sm font-medium", className)}>{label}</span>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isPending || maxSlots === 0}
              onClick={() => {
                setMaxSlots((current) => Math.max(0, current - 1));
                setIsSaved(false);
              }}
            >
              <Minus />
            </Button>

            <span className="w-8 text-center font-medium">{maxSlots}</span>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              onClick={() => {
                setMaxSlots((current) => current + 1);
                setIsSaved(false);
              }}
            >
              <Plus />
            </Button>
          </div>

          <Button
            type="submit"
            size="sm"
            className="w-20"
            disabled={isPending || isSaved}
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : isSaved ? (
              <>
                <Check />
              </>
            ) : (
              "保存"
            )}
          </Button>
        </div>
      </form>

      {state.errors?.maxSlots && (
        <p className="mt-2 text-sm text-red-500">{state.errors.maxSlots}</p>
      )}
    </div>
  );
}

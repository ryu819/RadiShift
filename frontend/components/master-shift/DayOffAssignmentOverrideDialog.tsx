"use client";

import { Loader2, LockKeyholeOpen } from "lucide-react";
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
import {
  type ActionState,
  overrideDayOffAssignmentForm,
} from "@/lib/actions/shift-assignments/override-day-off-assignment";
import type { DayOffAssignment } from "@/types/day-off-assignment";
import { badgeStyle } from "@/utils/badge-style";

type DayOffTypDayOffAssignmenteItemProps = {
  dayOffAssignment: DayOffAssignment;
  memberName: string;
  year: number;
  month: number;
  day: number;
};

export function DayOffAssignmentOverrideDialog({
  dayOffAssignment,
  memberName,
  year,
  month,
  day,
}: DayOffTypDayOffAssignmenteItemProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = await overrideDayOffAssignmentForm(prevState, formData);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-secondary"
        >
          <LockKeyholeOpen className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            管理者管理に切り替える
          </DialogTitle>

          <DialogDescription>
            この休み割当は本人の申請によって作成されています。
            管理者管理に切り替えると、本人はこの休みを返上できなくなります。
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{memberName}</p>

            <p className="mt-1 text-xs">{`${year}年${month}月${day}日`}</p>
          </div>

          <Badge
            variant="outline"
            style={badgeStyle(dayOffAssignment.dayOffType.colorCode)}
          >
            {dayOffAssignment.dayOffType.name}
          </Badge>
        </div>

        <form action={formAction}>
          <input
            type="hidden"
            name="dayOffAssignmentId"
            value={dayOffAssignment.id}
          />

          {state.error && (
            <p className="mb-4 text-sm text-red-500">{state.error}</p>
          )}

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : "切り替える"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

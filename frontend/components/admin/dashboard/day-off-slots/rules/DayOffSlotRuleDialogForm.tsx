"use client";

import { Settings } from "lucide-react";
import { useState } from "react";

import { dayOffSlotRuleWeekDays } from "@/components/admin/dashboard/day-off-slots/rules/day-off-slot-rule-week-days";
import { DayOffSlotRuleForm } from "@/components/admin/dashboard/day-off-slots/rules/DayOffSlotRuleForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
            {dayOffType.name}の枠ルールを設定します
          </DialogDescription>
        </DialogHeader>

        <div className="divide-y">
          {dayOffSlotRuleWeekDays.map(({ weekday, label, className }) => {
            const dayRule =
              dayOffSlotRules.find(
                (dayOffSlotRule) => dayOffSlotRule.weekday === weekday,
              ) ?? null;

            return (
              <DayOffSlotRuleForm
                key={weekday}
                dayOffType={dayOffType}
                dayRule={dayRule}
                weekday={weekday}
                label={label}
                className={className}
              />
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { dayOffSlotRuleWeekDays } from "@/components/admin/dashboard/day-off-slots/rules/day-off-slot-rule-week-days";
import { DayOffSlotRuleDialogForm } from "@/components/admin/dashboard/day-off-slots/rules/DayOffSlotRuleDialogForm";
import { cn } from "@/lib/utils";
import type { DayOffSlotRule } from "@/types/day-off-slot-rule";
import type { DayOffType } from "@/types/day-off-type";

type Props = {
  dayOffType: DayOffType;
  dayOffSlotRules: DayOffSlotRule[];
};

export function DayOffSlotRuleMobileItem({
  dayOffType,
  dayOffSlotRules,
}: Props) {
  return (
    <>
      <div className="space-y-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="size-3 rounded-full"
              style={{
                backgroundColor: dayOffType.colorCode,
              }}
            />

            <span className="font-medium">{dayOffType.name}</span>
          </div>

          <DayOffSlotRuleDialogForm
            dayOffType={dayOffType}
            dayOffSlotRules={dayOffSlotRules}
          />
        </div>

        <div className="grid grid-cols-4 gap-y-3">
          {dayOffSlotRuleWeekDays.map(({ weekday, label, className }) => {
            const dayRule = dayOffSlotRules.find(
              (rule) => rule.weekday === weekday,
            );

            return (
              <div key={weekday} className="space-y-1 text-center">
                <p className={cn("text-xs font-medium", className)}>{label}</p>

                <p
                  className={cn(
                    "text-sm font-medium",
                    !dayRule && "text-muted-foreground",
                  )}
                >
                  {dayRule ? `${dayRule.maxSlots}枠` : "未設定"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

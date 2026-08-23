import { dayOffSlotRuleWeekDays } from "@/components/admin/dashboard/day-off-slots/rules/day-off-slot-rule-week-days";
import { DayOffSlotRuleDialogForm } from "@/components/admin/dashboard/day-off-slots/rules/DayOffSlotRuleDialogForm";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DayOffSlotRule } from "@/types/day-off-slot-rule";
import type { DayOffType } from "@/types/day-off-type";

type Props = {
  dayOffType: DayOffType;
  dayOffSlotRules: DayOffSlotRule[];
};

export function DayOffSlotRuleItem({ dayOffType, dayOffSlotRules }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2">
            <span
              className="size-3 rounded-full"
              style={{
                backgroundColor: dayOffType.colorCode,
              }}
            />

            <span className="font-medium">{dayOffType.name}</span>
          </div>
        </TableCell>

        {dayOffSlotRuleWeekDays.map(({ weekday }) => {
          const dayRule = dayOffSlotRules.find(
            (rule) => rule.weekday === weekday,
          );

          return (
            <TableCell key={weekday} className={cn("w-24 text-center")}>
              <span
                className={cn(
                  "text-center font-medium",
                  !dayRule && "text-muted-foreground",
                )}
              >
                {dayRule ? `${dayRule.maxSlots}枠` : "未設定"}
              </span>
            </TableCell>
          );
        })}

        <TableCell className="w-24">
          <DayOffSlotRuleDialogForm
            dayOffType={dayOffType}
            dayOffSlotRules={dayOffSlotRules}
          />
        </TableCell>
      </TableRow>
    </>
  );
}

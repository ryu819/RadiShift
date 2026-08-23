import { dayOffSlotRuleWeekDays } from "@/components/admin/dashboard/day-off-slots/rules/day-off-slot-rule-week-days";
import { DayOffSlotRuleItem } from "@/components/admin/dashboard/day-off-slots/rules/DayOffSlotRuleItem";
import { DayOffSlotRuleMobileItem } from "@/components/admin/dashboard/day-off-slots/rules/DayOffSlotRuleMobileItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DayOffSlotRule } from "@/types/day-off-slot-rule";
import type { DayOffType } from "@/types/day-off-type";

type Props = {
  dayOffTypes: DayOffType[];
  dayOffSlotRules: DayOffSlotRule[];
};

export function DayOffSlotRuleSettingsCard({
  dayOffTypes,
  dayOffSlotRules,
}: Props) {
  return (
    <Card className="gap-4 pt-5 pb-2 shadow-none">
      <CardHeader>
        <div>
          <CardTitle className="text-base">基本ルール</CardTitle>

          <p className="mt-1 text-sm text-muted-foreground">
            新しくシフト月を作成するときに曜日ごとの休み枠を設定します。
          </p>
        </div>
      </CardHeader>

      <CardContent className="px-4">
        {dayOffTypes.length === 0 ? (
          <p className="px-6 pt-4 pb-6 text-center text-sm text-muted-foreground">
            休み枠を使用する休みタイプがありません
          </p>
        ) : (
          <>
            <div className="sm:hidden divide-y">
              {dayOffTypes.map((dayOffType) => {
                const dayOffTypeRules = dayOffSlotRules.filter(
                  (rule) => rule.dayOffTypeId === dayOffType.id,
                );

                return (
                  <DayOffSlotRuleMobileItem
                    key={dayOffType.id}
                    dayOffType={dayOffType}
                    dayOffSlotRules={dayOffTypeRules}
                  />
                );
              })}
            </div>

            <div className="max-sm:hidden ">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-44">休みタイプ</TableHead>

                    {dayOffSlotRuleWeekDays.map(
                      ({ weekday, label, className }) => (
                        <TableHead
                          key={weekday}
                          className={cn("text-center", className)}
                        >
                          {label}
                        </TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {dayOffTypes.map((dayOffType) => {
                    const dayOffTypeRules = dayOffSlotRules.filter(
                      (rule) => rule.dayOffTypeId === dayOffType.id,
                    );

                    return (
                      <DayOffSlotRuleItem
                        key={dayOffType.id}
                        dayOffType={dayOffType}
                        dayOffSlotRules={dayOffTypeRules}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

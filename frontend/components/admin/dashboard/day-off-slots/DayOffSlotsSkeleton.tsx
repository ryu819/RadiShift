import { ChevronLeft, ChevronRight, Settings } from "lucide-react";

import { calendarWeekdays } from "@/components/admin/dashboard/day-off-slots/calendar/day-off-slot-calendar-week-days";
import { dayOffSlotRuleWeekDays } from "@/components/admin/dashboard/day-off-slots/rules/day-off-slot-rule-week-days";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

function DayOffSlotRuleSkeleton() {
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
        <div className="divide-y sm:hidden">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-3 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-3 rounded-full" />

                  <Skeleton className="h-4 w-15" />
                </div>

                <Button type="button" variant="ghost" disabled>
                  <Settings />
                  設定
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-y-3">
                {dayOffSlotRuleWeekDays.map(({ weekday, label, className }) => (
                  <div key={weekday} className="space-y-1 text-center">
                    <p className={cn("text-xs font-medium", className)}>
                      {label}
                    </p>

                    <Skeleton className="mx-auto h-4 w-8" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="max-sm:hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-44">休みタイプ</TableHead>

                {dayOffSlotRuleWeekDays.map(({ weekday, label, className }) => (
                  <TableHead
                    key={weekday}
                    className={cn("text-center", className)}
                  >
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {Array.from({ length: 2 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-3 rounded-full" />

                      <Skeleton className="h-4 w-15" />
                    </div>
                  </TableCell>

                  {dayOffSlotRuleWeekDays.map(({ weekday }) => (
                    <TableCell key={weekday} className="w-24 text-center">
                      <Skeleton className="mx-auto h-4 w-8" />
                    </TableCell>
                  ))}

                  <TableCell className="w-24">
                    <Button type="button" variant="ghost" disabled>
                      <Settings />
                      設定
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function DayOffSlotCalendarSkeleton() {
  return (
    <Card className="gap-4 pt-5 pb-4 shadow-none">
      <CardHeader>
        <div>
          <CardTitle className="text-base">特定日の調整</CardTitle>

          <p className="mt-1 text-sm text-muted-foreground">
            日付を選択して、休み枠を変更します。
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">休みタイプ</p>

          <Select disabled>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="休みタイプを選択" />
            </SelectTrigger>
          </Select>
        </div>

        <div className="rounded-sm border">
          <div className="border-b py-2">
            <div className="flex items-center justify-center gap-1 md:gap-3">
              <Button variant="link" size="icon" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Skeleton className="h-7 w-32 md:h-8" />

              <Button variant="link" size="icon" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b bg-muted/30">
            {calendarWeekdays.map((weekday) => (
              <div
                key={weekday.label}
                className={cn(
                  "py-2 text-center text-xs font-medium text-muted-foreground",
                  weekday.className,
                )}
              >
                {weekday.label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: 42 }).map((_, index) => {
              const isLastColumn = index % 7 === 6;

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-20 border-r border-b p-1 sm:min-h-24 sm:p-2",
                    isLastColumn && "border-r-0",
                  )}
                >
                  <div className="flex h-full flex-col">
                    <Skeleton className="h-4 w-4" />

                    <Skeleton className="mx-auto my-auto h-4 w-6 sm:w-8" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DayOffSlotsSkeleton() {
  return (
    <div className="space-y-5">
      <DayOffSlotRuleSkeleton />

      <DayOffSlotCalendarSkeleton />
    </div>
  );
}

import { ChevronLeft, ChevronRight } from "lucide-react";

import { calendarWeekdays } from "@/components/admin/dashboard/day-off-slots/calendar/day-off-slot-calendar-week-days";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function MyShiftsSkeleton() {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center gap-1 md:gap-3">
          <Button variant="link" size="icon" disabled>
            <ChevronLeft className="size-4" />
          </Button>

          <Skeleton className="h-7 w-32" />

          <Button variant="link" size="icon" disabled>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 px-3 py-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked disabled />
            <span>勤務</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked disabled />
            <span>休み</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked disabled />
            <span>モダリティ</span>
          </label>
        </div>
        <Card className="gap-0 py-0 shadow-none">
          <div className="grid grid-cols-7 border-b bg-muted/30">
            {calendarWeekdays.map((weekday, index) => (
              <div
                key={weekday.label}
                className={cn(
                  "py-2 text-center text-xs font-medium text-muted-foreground",
                  weekday.className,
                  index !== 6 && "border-r",
                )}
              >
                {weekday.label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, index) => {
              const isLastColumn = index % 7 === 6;
              const isLastRow = index >= 28;
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-21 bg-muted/20 p-2 sm:min-h-45",
                    !isLastColumn && "border-r",
                    !isLastRow && "border-b",
                  )}
                >
                  <Skeleton className="h-4 w-4" />
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid items-start gap-4 sm:grid-cols-2">
          <RequestHistoryCardSkeleton shiftType={"休み"} />

          <RequestHistoryCardSkeleton shiftType={"勤務"} />
        </div>
      </div>
    </>
  );
}

function RequestHistoryCardSkeleton({ shiftType }: { shiftType: string }) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">{shiftType}申請履歴</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="py-2 first:pt-0 last:pb-0 lg:flex lg:items-center lg:py-4"
            >
              <div className="min-w-30">
                <Skeleton className="h-5 w-24" />
              </div>

              <div className="max-lg:mt-2 flex w-full items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>

                <div className="flex items-center gap-1">
                  <div className="flex min-w-16 items-center">
                    <Skeleton className="h-5 w-11 rounded-full" />
                  </div>

                  <div className="flex min-w-4 justify-center">
                    <Skeleton className="size-4 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { CalendarCheck2 } from "lucide-react";
import { Suspense } from "react";

import { CreateScheduleMonthButton } from "@/components/admin/dashboard/overview/schedule-months/CreateScheduleMonthButton";
import { ScheduleMonthSettingsDialogForm } from "@/components/admin/dashboard/overview/schedule-months/ScheduleMonthSettingsDialogForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getScheduleMonths } from "@/lib/actions/schedule-months/get-schedule-months";

export function ScheduleMonthsCard() {
  return (
    <Card className="gap-4 py-5 shadow-none">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarCheck2 className="size-5" />
          シフト月
        </CardTitle>

        <Suspense
          fallback={
            <Button type="button" variant="outline" size="sm" disabled>
              シフト月を作成
            </Button>
          }
        >
          <CreateScheduleMonthButton />
        </Suspense>
      </CardHeader>

      <CardContent>
        <Suspense fallback={<ScheduleMonthsSkeleton />}>
          <ScheduleMonthsList />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function ScheduleMonthsList() {
  const scheduleMonths = (await getScheduleMonths()) ?? [];

  if (scheduleMonths.length == 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        作成済みのシフト月はありません
      </p>
    );
  }
  return (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 ">
      {scheduleMonths.map((scheduleMonth) => (
        <ScheduleMonthSettingsDialogForm
          key={scheduleMonth.id}
          scheduleMonth={scheduleMonth}
        />
      ))}
    </div>
  );
}

function ScheduleMonthsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-20" />
      ))}
    </div>
  );
}

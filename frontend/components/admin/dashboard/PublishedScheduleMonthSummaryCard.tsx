import { CalendarCheck2 } from "lucide-react";
import { Suspense } from "react";

import { SummaryValueSkeleton } from "@/components/admin/dashboard/SummaryValueSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { getScheduleMonths } from "@/lib/actions/get-schedule-months";

export function PublishedScheduleMonthSummaryCard() {
  return (
    <Card className="py-0 shadow-none">
      <CardContent className="flex h-full flex-col px-5 py-5">
        <div className="flex items-center gap-3">
          <CalendarCheck2 className="size-6 text-primary" />

          <p className="text-sm font-medium text-muted-foreground">
            公開シフト月
          </p>
        </div>
        <Suspense fallback={<SummaryValueSkeleton />}>
          <ScheduleMonthCount />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function ScheduleMonthCount() {
  const scheduleMonths = await getScheduleMonths();
  return (
    <div className="flex items-baseline justify-center gap-1.5 pt-5">
      <span className="text-3xl font-semibold">{scheduleMonths?.length}</span>

      <span className="text-base font-medium text-muted-foreground">か月</span>
    </div>
  );
}

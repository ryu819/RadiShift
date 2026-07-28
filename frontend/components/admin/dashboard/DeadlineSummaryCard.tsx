import { CalendarClock } from "lucide-react";
import { Suspense } from "react";

import { SummaryValueSkeleton } from "@/components/admin/dashboard/SummaryValueSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { getFacility } from "@/lib/actions/get-facility";

export function DeadlineSummaryCard() {
  return (
    <Card className="py-0 shadow-none">
      <CardContent className="flex h-full flex-col px-5 py-5">
        <div className="flex items-center gap-3">
          <CalendarClock className="size-6 text-primary" />
          <Suspense fallback={<DeadlineMonthValueSkeleton />}>
            <DeadlineMonthValue />
          </Suspense>
        </div>
        <Suspense fallback={<SummaryValueSkeleton />}>
          <DeadlineDayValue />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function DeadlineDayValue() {
  const facility = await getFacility();

  return (
    <div className="flex items-baseline justify-center gap-1.5 pt-5">
      <span className="text-3xl font-semibold">
        {facility?.nextRequestDeadline.daysRemaining}
      </span>

      <span className="text-base font-medium text-muted-foreground">日</span>
    </div>
  );
}

async function DeadlineMonthValue() {
  const facility = await getFacility();

  return (
    <p className="text-sm font-medium text-muted-foreground">
      {facility?.nextRequestDeadline.month}月シフトの申請締切まで
    </p>
  );
}

function DeadlineMonthValueSkeleton() {
  return (
    <div className="flex items-center">
      <span className="h-4 w-4 animate-pulse rounded-sm bg-muted" />

      <span className="text-sm font-medium text-muted-foreground">
        月シフトの申請締切まで
      </span>
    </div>
  );
}

import { CalendarCheck2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function PublishedScheduleMonthSummaryCard({
  count,
}: {
  count?: number;
}) {
  return (
    <Card className="py-0 shadow-none">
      <CardContent className="flex h-full flex-col px-5 py-5">
        <div className="flex items-center gap-3">
          <CalendarCheck2 className="size-6 text-primary" />

          <p className="text-sm font-medium text-muted-foreground">
            公開シフト
          </p>
        </div>

        <div className="flex items-baseline justify-center gap-1.5 pt-5">
          <span className="text-3xl font-semibold">{count}</span>

          <span className="text-base font-medium text-muted-foreground">
            か月
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

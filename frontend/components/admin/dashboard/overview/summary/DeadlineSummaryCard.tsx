import { CalendarClock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function DeadlineSummaryCard({
  month,
  daysRemaining,
}: {
  month?: number;
  daysRemaining?: number;
}) {
  return (
    <Card className="py-0 shadow-none">
      <CardContent className="flex h-full flex-col px-5 py-5">
        <div className="flex items-center gap-3">
          <CalendarClock className="size-6 text-primary" />

          <p className="text-sm font-medium text-muted-foreground">
            {month !== undefined
              ? `${month}月シフトの申請締切まで`
              : "シフトの申請締切まで"}
          </p>
        </div>

        <div className="flex items-baseline justify-center gap-1.5 pt-5">
          <span className="text-3xl font-semibold">{daysRemaining}</span>

          <span className="text-base font-medium text-muted-foreground">
            日
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

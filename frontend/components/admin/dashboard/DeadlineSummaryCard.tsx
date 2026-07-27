import { CalendarClock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getFacility } from "@/lib/actions/get-facility";

export async function DeadlineSummaryCard() {
  const facility = await getFacility();
  return (
    <Card className="py-0 shadow-none">
      <CardContent className="flex h-full flex-col px-5 py-5">
        <div className="flex items-center gap-3">
          <CalendarClock className="size-6 text-primary" />

          <p className="text-sm font-medium text-muted-foreground">
            {facility?.nextRequestDeadline.month}
            月シフトの申請締切まで
          </p>
        </div>

        <div className="flex items-baseline justify-center gap-1.5 pt-5">
          <span className="text-3xl font-semibold">
            {facility?.nextRequestDeadline.daysRemaining}
          </span>

          <span className="text-base font-medium text-muted-foreground">
            日
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

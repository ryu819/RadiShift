import { FileText } from "lucide-react";
import { Suspense } from "react";

import { SummaryValueSkeleton } from "@/components/admin/dashboard/SummaryValueSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { getDayOffRequests } from "@/lib/actions/get-day-off-requests";
import { getWorkRequests } from "@/lib/actions/get-work-requests";

export function PendingRequestSummaryCard() {
  return (
    <Card className=" py-0 shadow-none">
      <CardContent className="flex h-full flex-col px-5 py-5">
        <div className="flex items-center gap-3">
          <FileText className="size-6 text-primary" />

          <p className="text-sm font-medium text-muted-foreground">
            未処理の申請
          </p>
        </div>
        <Suspense fallback={<SummaryValueSkeleton />}>
          <PendingRequestCount />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function PendingRequestCount() {
  const [workRequests, dayOffRequests] = await Promise.all([
    getWorkRequests(),
    getDayOffRequests(),
  ]);

  const pendingWorkRequests =
    workRequests?.filter(
      (workRequest) => workRequest.requestStatus === "pending",
    ) ?? [];
  const pendingDayOffRequests =
    dayOffRequests?.filter(
      (dayOffRequest) => dayOffRequest.requestStatus === "pending",
    ) ?? [];
  return (
    <div className="flex items-baseline justify-center gap-1.5 pt-5">
      <span className="text-3xl font-semibold">
        {pendingWorkRequests.length + pendingDayOffRequests.length}
      </span>

      <span className="text-base font-medium text-muted-foreground">件</span>
    </div>
  );
}

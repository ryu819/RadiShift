import { FileText } from "lucide-react";
import { Suspense } from "react";

import { RequestReviewDialogForm } from "@/components/admin/dashboard/requests/RequestReviewDialogForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDayOffRequests } from "@/lib/actions/get-day-off-requests";
import { getWorkRequests } from "@/lib/actions/get-work-requests";

export type PendingRequestItem = {
  key: string;
  requestId: number;
  requestKind: "work" | "dayOff";
  userName: string;
  requestedDate: string;
  requestWeekdayLabel: string;
  typeName: string;
  colorCode: string;
  createdAt: string;
  isReturn: boolean;
};

export function PendingRequestsCard() {
  return (
    <Card className="gap-4 py-5 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="size-5" />
          未処理の申請
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Suspense fallback={<RequestListSkeleton />}>
          <PendingRequestsList />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function PendingRequestsList() {
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

  const PendingRequests: PendingRequestItem[] = [
    ...pendingDayOffRequests.map((request) => ({
      key: `day-off-${request.id}`,
      requestId: request.id,
      requestKind: "dayOff" as const,
      userName: request.user?.name ?? "名前未設定",
      requestedDate: request.scheduleDay.date,
      requestWeekdayLabel: request.scheduleDay.weekdayLabel,
      typeName: request.dayOffType.name,
      colorCode: request.dayOffType.colorCode,
      createdAt: request.createdAt,
      isReturn: request.isReturn,
    })),

    ...pendingWorkRequests.map((request) => ({
      key: `work-${request.id}`,
      requestId: request.id,
      requestKind: "work" as const,
      userName: request.user?.name ?? "名前未設定",
      requestedDate: request.scheduleDay.date,
      requestWeekdayLabel: request.scheduleDay.weekdayLabel,
      typeName: request.workType.name,
      colorCode: request.workType.colorCode,
      createdAt: request.createdAt,
      isReturn: request.isReturn,
    })),
  ].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const visiblePendingRequests = PendingRequests.slice(0, 5);

  const remainingRequests =
    PendingRequests.length - visiblePendingRequests.length;
  return (
    <>
      {visiblePendingRequests.length > 0 ? (
        <div>
          {visiblePendingRequests.map((request, index) => (
            <div key={request.key}>
              <RequestReviewDialogForm request={request} />

              {index < visiblePendingRequests.length - 1 && <Separator />}
            </div>
          ))}

          {remainingRequests > 0 && (
            <>
              <Separator />

              <div className="flex items-center justify-center py-2 pt-4">
                ほか{remainingRequests}件
              </div>
            </>
          )}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          未処理の申請はありません
        </p>
      )}
    </>
  );
}

function RequestListSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index}>
          <div className="flex items-center justify-between py-3">
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
            </div>

            <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
          </div>

          {index < 3 && <Separator />}
        </div>
      ))}
    </div>
  );
}

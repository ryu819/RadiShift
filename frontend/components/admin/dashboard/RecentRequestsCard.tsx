import { FileText } from "lucide-react";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDayOffRequests } from "@/lib/actions/get-day-off-requests";
import { getWorkRequests } from "@/lib/actions/get-work-requests";
import { badgeStyle } from "@/utils/badge-style";

type RecentRequestItem = {
  key: string;
  userName: string;
  requestedDate: string;
  requestWeekdayLabel: string;
  typeName: string;
  colorCode: string;
  createdAt: string;
};

function formatRequestedDate(dateString: string, weekdayLabel: string) {
  const [_year, month, day] = dateString.split("-").map(Number);

  return `${month}/${day}（${weekdayLabel}）`;
}

function formatCreatedAt(dateString: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  }).format(new Date(dateString));
}

export function RecentRequestsCard() {
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
          <RecentRequestsList />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function RecentRequestsList() {
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

  const recentRequests: RecentRequestItem[] = [
    ...pendingDayOffRequests.map((request) => ({
      key: `day-off-${request.id}`,
      userName: request.user?.name ?? "名前未設定",
      requestedDate: request.scheduleDay.date,
      requestWeekdayLabel: request.scheduleDay.weekdayLabel,
      typeName: request.dayOffType.name,
      colorCode: request.dayOffType.colorCode,
      createdAt: request.createdAt,
    })),

    ...pendingWorkRequests.map((request) => ({
      key: `work-${request.id}`,
      userName: request.user?.name ?? "名前未設定",
      requestedDate: request.scheduleDay.date,
      requestWeekdayLabel: request.scheduleDay.weekdayLabel,
      typeName: request.workType.name,
      colorCode: request.workType.colorCode,
      createdAt: request.createdAt,
    })),
  ].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const visibleRecentRequests = recentRequests.slice(0, 5);

  const remainingRequests =
    recentRequests.length - visibleRecentRequests.length;
  return (
    <>
      {visibleRecentRequests.length > 0 ? (
        <div>
          {visibleRecentRequests.map((request, index) => (
            <div key={index} className="mb-1">
              <div className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{request.userName}</p>

                  <p className="text-xs text-muted-foreground">
                    申請日時：{formatCreatedAt(request.createdAt)}
                  </p>
                </div>

                <div className="flex items-center">
                  <p className="text-xs">
                    {formatRequestedDate(
                      request.requestedDate,
                      request.requestWeekdayLabel,
                    )}
                  </p>
                  <Badge
                    className="font-semibold"
                    style={badgeStyle(request.colorCode)}
                  >
                    {request.typeName}
                  </Badge>
                </div>
              </div>

              {index < visibleRecentRequests.length - 1 && <Separator />}
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

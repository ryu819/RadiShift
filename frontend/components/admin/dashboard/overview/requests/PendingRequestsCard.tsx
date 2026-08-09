import { FileText } from "lucide-react";
import { Suspense } from "react";

import { RequestReviewDialogForm } from "@/components/admin/dashboard/overview/requests/RequestReviewDialogForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPendingRequests } from "@/lib/actions/get-pending-requests";

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
  const pendingRequests = (await getPendingRequests()) ?? [];

  const visiblePendingRequests = pendingRequests.slice(0, 5);

  const remainingRequests =
    pendingRequests.length - visiblePendingRequests.length;
  return (
    <>
      {visiblePendingRequests.length > 0 ? (
        <div>
          {visiblePendingRequests.map((request, index) => (
            <div key={request.id + request.requestKind}>
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

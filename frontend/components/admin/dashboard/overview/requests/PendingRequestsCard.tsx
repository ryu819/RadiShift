import { FileText } from "lucide-react";
import { Suspense } from "react";

import { PendingRequestsList } from "@/components/admin/dashboard/overview/requests/PendingRequestsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getPendingRequests } from "@/lib/actions/requests/get-pending-requests";

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
          <PendingRequestsContent />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function PendingRequestsContent() {
  const pendingRequests = (await getPendingRequests()) ?? [];

  return <PendingRequestsList pendingRequests={pendingRequests} />;
}

function RequestListSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index}>
          <div className="flex items-center justify-between py-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />

              <Skeleton className="h-3 w-32" />
            </div>

            <Skeleton className="h-6 w-24" />
          </div>

          {index < 4 && <Separator />}
        </div>
      ))}
    </div>
  );
}

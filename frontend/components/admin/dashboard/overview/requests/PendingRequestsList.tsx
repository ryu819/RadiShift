"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { RequestReviewDialogForm } from "@/components/admin/dashboard/overview/requests/RequestReviewDialogForm";
import { Button } from "@/components/ui/button";
import type { PendingRequest } from "@/types/pending-request";

const REQUESTS_PER_PAGE = 5;

type Props = {
  pendingRequests: PendingRequest[];
};

export function PendingRequestsList({ pendingRequests }: Props) {
  const [visibleCount, setVisibleCount] = useState(REQUESTS_PER_PAGE);

  const visiblePendingRequests = pendingRequests.slice(0, visibleCount);

  const remainingRequests =
    pendingRequests.length - visiblePendingRequests.length;

  const handleLoadMore = () => {
    setVisibleCount((currentCount) =>
      Math.min(currentCount + REQUESTS_PER_PAGE, pendingRequests.length),
    );
  };

  return (
    <>
      {pendingRequests.length > 0 ? (
        <div className="divide-y">
          {visiblePendingRequests.map((request) => (
            <div key={request.id + request.requestKind}>
              <RequestReviewDialogForm request={request} />
            </div>
          ))}

          {remainingRequests > 0 && (
            <>
              <Button
                type="button"
                variant="ghost"
                className="mt-2 w-full text-muted-foreground"
                onClick={handleLoadMore}
              >
                <ChevronDown className="size-4" />
                もっと読み込む（残り{remainingRequests}件）
              </Button>
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

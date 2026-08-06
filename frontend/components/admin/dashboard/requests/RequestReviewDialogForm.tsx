"use client";

import { ChevronRight, Loader2, RotateCcw } from "lucide-react";
import { useActionState, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateRequestStatusForm } from "@/lib/actions/update-request-status";
import { PendingRequest } from "@/types/pending-request";
import { badgeStyle } from "@/utils/badge-style";

function formatRequestedDate(dateString: string, weekdayLabel: string) {
  const [_year, month, day] = dateString.split("-").map(Number);

  return `${month}/${day}（${weekdayLabel}）`;
}

function formatCreatedAt(dateString: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  }).format(new Date(dateString));
}

export function RequestReviewDialogForm({
  request,
}: {
  request: PendingRequest;
}) {
  const [_serverState, formAction, isPending] = useActionState(
    updateRequestStatusForm,
    {},
  );

  const [clickedStatus, setClickedStatus] = useState<
    "approved" | "rejected" | null
  >(null);

  const isReturn = request.isReturn;

  const dateLabel = isReturn ? "返上日" : "希望日";

  const contentLabel = isReturn ? "返上内容" : "希望内容";

  const requestTypeLabel = isReturn
    ? "返上希望"
    : request.requestKind === "work"
      ? "勤務希望"
      : "休み希望";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group cursor-pointer w-full rounded-sm px-2 text-left transition-colors hover:bg-muted/60"
        >
          <div className="flex items-center justify-between py-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{request.userName}</p>

                {isReturn && (
                  <div className="flex items-center justify-center gap-0.5 text-amber-700">
                    <RotateCcw className="size-3" />

                    <p className="text-xs font-medium">返上</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                申請日時：
                {formatCreatedAt(request.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-2">
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

              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xs sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            申請内容の確認
          </DialogTitle>
        </DialogHeader>

        {isReturn && (
          <div className="flex items-center justify-center gap-1 text-amber-700">
            <RotateCcw className="size-4.5" />

            <p className="text-md font-semibold">返上</p>
          </div>
        )}

        <div className="mt-2 space-y-4 rounded-lg border bg-muted/30 p-4 text-sm">
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">申請者：</p>
              <p>{request.userName}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">申請種別：</p>
              <p>{requestTypeLabel}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">{dateLabel}：</p>
              <p>
                {formatRequestedDate(
                  request.requestedDate,
                  request.requestWeekdayLabel,
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">{contentLabel}：</p>
              <div>
                <Badge
                  className="font-semibold"
                  style={badgeStyle(request.colorCode)}
                >
                  {request.typeName}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">申請日時：</p>
              <p>{formatCreatedAt(request.createdAt)}</p>
            </div>
          </div>
        </div>

        <form action={formAction}>
          <input type="hidden" name="requestId" value={request.id} />

          <input type="hidden" name="requestKind" value={request.requestKind} />

          <DialogFooter className="mt-4 grid grid-cols-2 gap-2">
            <Button
              type="submit"
              name="requestStatus"
              value="approved"
              disabled={isPending}
              onClick={() => setClickedStatus("approved")}
            >
              {isPending && clickedStatus === "approved" ? (
                <Loader2 className="animate-spin" />
              ) : (
                "承認"
              )}
            </Button>
            <Button
              type="submit"
              name="requestStatus"
              value="rejected"
              variant="secondary"
              disabled={isPending}
              onClick={() => setClickedStatus("rejected")}
            >
              {isPending && clickedStatus === "rejected" ? (
                <Loader2 className="animate-spin" />
              ) : (
                "否認"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Loader2, RotateCcw, Trash2 } from "lucide-react";
import { startTransition, useActionState, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  type ActionState,
  deleteWorkRequestForm,
} from "@/lib/actions/requests/delete-work-request";
import { dayjs } from "@/lib/dayjs";
import type { WorkRequest } from "@/types/work-request";
import { badgeStyle } from "@/utils/badge-style";

type Props = {
  workRequest: WorkRequest;
};

export function WorkRequestDeleteDialog({ workRequest }: Props) {
  const [open, setOpen] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = await deleteWorkRequestForm(prevState, formData);

      if (nextState.success) {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    {
      success: false,
    },
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setIsAgreed(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive active:text-destructive cursor-pointer transition-colors" />
      </DialogTrigger>

      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            申請を取り消す
          </DialogTitle>
          <p className="my-1 text-left">
            申請を取り消します。
            取り消した申請は元に戻せません。本当に取り消しますか？
          </p>
        </DialogHeader>

        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex justify-center items-center gap-1">
            <p className="text-sm font-medium">
              {dayjs(workRequest.scheduleDay.date).format("M月D日")}（
              {workRequest.scheduleDay.weekdayLabel}）
            </p>
            <Badge
              variant="outline"
              style={badgeStyle(workRequest.workType.colorCode)}
            >
              {workRequest.workType.name}
            </Badge>

            {workRequest.isReturn && (
              <div className="flex items-center gap-1 text-amber-700">
                <RotateCcw className="size-3" />

                <span className="text-xs font-medium">返上</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 my-1">
          <Checkbox
            id="deleteAgreement"
            checked={isAgreed}
            onCheckedChange={(checked) => setIsAgreed(checked === true)}
          />
          <label htmlFor="deleteAgreement" className="text-sm">
            内容を確認し、申請を削除します
          </label>
        </div>

        <form action={formAction}>
          <input type="hidden" name="workRequestId" value={workRequest.id} />

          {state.error && (
            <p className="mb-4 text-sm text-red-500">{state.error}</p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              variant="destructive"
              className="w-full"
              disabled={!isAgreed || isPending}
            >
              {isPending ? <Loader2 className="animate-spin" /> : "取り消す"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

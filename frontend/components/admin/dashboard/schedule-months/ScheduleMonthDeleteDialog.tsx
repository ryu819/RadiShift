"use client";
import { Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteScheduleMonthForm } from "@/lib/actions/delete-schedule-month";
import type { ScheduleMonths } from "@/types/schedule-months";

type DeleteDialogProps = {
  scheduleMonth: ScheduleMonths;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ScheduleMonthDeleteDialog({
  scheduleMonth,
  open,
  onOpenChange,
}: DeleteDialogProps) {
  const [_serverState, formAction, isPending] = useActionState(
    deleteScheduleMonthForm,
    {},
  );

  const [isAgreed, setIsAgreed] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setIsAgreed(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">
            {scheduleMonth.year}年 {scheduleMonth.month}
            月のシフト月を削除
          </DialogTitle>

          <p className="my-4 text-left">
            シフト月を削除すると、これまでのデータは全て削除され、復元できなくなります。この操作は取り消せません。本当にシフト月を削除してもよろしいですか？
          </p>
        </DialogHeader>
        <div className="mb-4 flex items-start gap-2">
          <input
            id="account-delete-agreement"
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="account-delete-agreement" className="text-sm">
            内容を確認し、アカウント削除に同意します
          </label>
        </div>

        <form action={formAction}>
          <input
            type="hidden"
            name="scheduleMonthId"
            value={scheduleMonth.id}
          />

          <DialogFooter>
            <Button
              type="submit"
              variant="destructive"
              disabled={!isAgreed || isPending}
              className="w-full"
            >
              {isPending ? <Loader2 className="animate-spin" /> : "削除"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

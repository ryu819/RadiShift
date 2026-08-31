"use client";

import { Loader2 } from "lucide-react";
import { startTransition, useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ActionState,
  deleteDayOffTypeForm,
} from "@/lib/actions/shift-types/delete-day-off-type";
import type { DayOffType } from "@/types/day-off-type";

type Props = {
  dayOffType: DayOffType;
  onOpenChange: (open: boolean) => void;
};

export function DayOffTypeDeleteDialog({ dayOffType, onOpenChange }: Props) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = await deleteDayOffTypeForm(prevState, formData);

      if (nextState.success) {
        startTransition(() => {
          onOpenChange(false);
        });
      }

      return nextState;
    },
    {
      success: false,
      error: "",
    },
  );

  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-sm space-y-2">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            休みタイプを削除
          </DialogTitle>

          <p className="my-1 text-left">
            「{dayOffType.name}」を削除します。
            この操作は取り消せません。本当に削除してもよろしいですか？
            （過去のシフトにデータは残ります）
          </p>
        </DialogHeader>
        <div className="flex items-start gap-2">
          <input
            id="deleteAgreement"
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            className="mt-1"
          />

          <label htmlFor="deleteAgreement" className="text-sm">
            内容を確認し、「{dayOffType.name}」を削除します
          </label>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="dayOffTypeId" value={dayOffType.id} />

          {state.error && <p className="text-sm text-red-500">{state.error}</p>}

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

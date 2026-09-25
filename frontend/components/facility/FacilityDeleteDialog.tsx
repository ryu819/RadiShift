"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import { useActionState, useState } from "react";

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
import { deleteFacility } from "@/lib/actions/facility/delete-facility";

type Props = {
  facilityName: string;
};

export function FacilityDeleteDialog({ facilityName }: Props) {
  const [state, formAction, isPending] = useActionState(deleteFacility, {
    error: "",
  });

  const [open, setOpen] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setIsAgreed(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="destructiveOutline"
          size="lg"
          className="w-full"
        >
          施設を削除
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xs sm:max-w-sm">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle className="text-center flex justify-center items-center gap-1">
              <TriangleAlert className="size-5" />
              施設を削除
            </DialogTitle>

            <div className="my-4 space-y-3 text-left text-sm">
              <p>
                この操作は取り消せません。施設に紐づくシフト・申請・シフトタイプ・休み枠などの全てデータが削除されます。
              </p>

              <p>施設に所属しているユーザーのアカウントは削除されません。</p>
            </div>
          </DialogHeader>

          <div className="mb-6 mt-2 flex items-center gap-2">
            <Checkbox
              id="deleteAgreement"
              checked={isAgreed}
              onCheckedChange={(checked) => setIsAgreed(checked === true)}
            />

            <label htmlFor="deleteAgreement" className="text-sm">
              内容を確認し、「{facilityName}」を削除します
            </label>
          </div>

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
              {isPending ? <Loader2 className="animate-spin" /> : "施設を削除"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

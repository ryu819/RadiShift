"use client";

import { Loader2 } from "lucide-react";
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
import { leaveFacility } from "@/lib/actions/facility/leave-facility";

export function LeaveFacilityDialogButton() {
  const [_serverState, formAction, isPending] = useActionState(leaveFacility, {
    error: "",
  });

  const [isAgreed, setIsAgreed] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setIsAgreed(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="w-30" variant="secondaryOutline">
          施設を脱退
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle className="text-center">施設を脱退</DialogTitle>
            <p className="my-4 text-left">
              施設を脱退すると、この施設の情報にアクセスできなくなります。この操作は取り消せません。本当に施設を脱退してもよろしいですか？
            </p>
          </DialogHeader>
          <div className="mb-4 flex items-center gap-2">
            <Checkbox
              id="deleteAgreement"
              checked={isAgreed}
              onCheckedChange={(checked) => setIsAgreed(checked === true)}
            />
            <label htmlFor="deleteAgreement" className="text-sm">
              内容を確認し、施設を脱退します
            </label>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              variant="secondary"
              disabled={!isAgreed || isPending}
            >
              {isPending ? <Loader2 className="animate-spin" /> : "施設を脱退"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

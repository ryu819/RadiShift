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
import { deleteUser } from "@/lib/actions/account/delete-user";

export function AccountDeleteDialogButton() {
  const [_serverState, formAction, isPending] = useActionState(deleteUser, {
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
        <Button type="button" className="w-30" variant="destructiveOutline">
          アカウント削除
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle className="text-center">アカウント削除</DialogTitle>
            <p className="my-4 text-left">
              アカウントを削除すると、これまでのデータは全て削除され、復元できなくなります。この操作は取り消せません。本当にアカウントを削除してもよろしいですか？
            </p>
          </DialogHeader>
          <div className="mb-4 flex items-center gap-2">
            <Checkbox
              id="deleteAgreement"
              checked={isAgreed}
              onCheckedChange={(checked) => setIsAgreed(checked === true)}
            />
            <label htmlFor="deleteAgreement" className="text-sm">
              内容を確認し、アカウント削除に同意します
            </label>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              variant="destructive"
              disabled={!isAgreed || isPending}
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "アカウント削除"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

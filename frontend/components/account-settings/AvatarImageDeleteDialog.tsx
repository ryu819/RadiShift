"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteAvatarImage } from "@/lib/actions/account/delete-avatar-image";

export function AvatarImageDeleteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isAgreed, setIsAgreed] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return;

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setIsAgreed(false);
    }
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteAvatarImage();
      onOpenChange(false);
      setIsAgreed(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">アイコンを削除</DialogTitle>
          <p className="my-2 text-left">
            アイコンを削除すると、デフォルトのアイコンに戻ります。削除した画像は復元できません。本当にアイコンを削除してもよろしいですか？
          </p>
        </DialogHeader>
        <div className="mb-2 flex items-center gap-2">
          <Checkbox
            id="avatarImageDeleteAgreement"
            checked={isAgreed}
            onCheckedChange={(checked) => setIsAgreed(checked === true)}
          />
          <label htmlFor="avatarImageDeleteAgreement" className="text-sm">
            内容を確認し、アイコンを削除します
          </label>
        </div>
        <DialogFooter>
          <Button
            type="button"
            className="w-full"
            variant="destructive"
            disabled={!isAgreed || isPending}
            onClick={handleDelete}
          >
            {isPending ? <Loader2 className="animate-spin" /> : "削除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

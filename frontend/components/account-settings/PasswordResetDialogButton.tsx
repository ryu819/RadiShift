"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { requestPasswordReset } from "@/lib/actions/request-password-reset";

function PasswordResetSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" />
      ) : (
        "パスワード再設定を送信"
      )}
    </Button>
  );
}

export function PasswordResetDialogButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" className="w-35" variant="outline">
          パスワード再設定
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <form action={requestPasswordReset}>
          <DialogHeader>
            <DialogTitle className="text-center">パスワード再設定</DialogTitle>
            <DialogDescription className="my-4">
              登録済みのメールアドレス宛に、パスワード再設定用のメールを送信します。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <PasswordResetSubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

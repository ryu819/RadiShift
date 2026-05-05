"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";

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

export function PasswordResetDialogButton() {
  const [_serverState, formAction, isPending] = useActionState(
    requestPasswordReset,
    {
      errors: {},
      values: {},
    },
  );
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" className="w-35" variant="outline">
          パスワード再設定
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle className="text-center">パスワード再設定</DialogTitle>
            <DialogDescription className="my-4">
              登録済みのメールアドレス宛に、パスワード再設定用のメールを送信します。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "パスワード再設定を送信"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

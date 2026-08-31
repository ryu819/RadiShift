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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ActionState,
  requestPasswordReset,
} from "@/lib/actions/auth/request-password-reset";

export function PasswordResetDialogButton() {
  const [open, setOpen] = useState(false);
  const [_serverState, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = await requestPasswordReset(prevState, formData);

      if (nextState.success) {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    {
      success: false,
      errors: {},
      values: {},
    },
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="w-35" variant="outline">
          パスワード再設定
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle className="text-center">パスワード再設定</DialogTitle>
            <p className="my-4 text-left">
              登録済みのメールアドレス宛に、パスワード再設定用のメールを送信します。
            </p>
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

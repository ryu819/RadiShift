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

export function PasswordResetDialogButton({
  passwordSet,
}: {
  passwordSet: boolean;
}) {
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

  const title = passwordSet ? "パスワード再設定" : "パスワードを設定";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="w-35" variant="outline">
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle className="text-center">{title}</DialogTitle>
            <p className="my-4 text-left">
              {passwordSet
                ? "登録済みのメールアドレス宛に、パスワード再設定用のメールを送信します。"
                : "登録済みのメールアドレス宛に、パスワード設定用のメールを送信します。"}
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : passwordSet ? (
                "パスワード再設定メールを送信"
              ) : (
                "パスワード設定メールを送信"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { useForm } from "react-hook-form";

import { GoogleButton } from "@/components/google-auth/GoogleButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type ActionState,
  linkGoogleAccount,
} from "@/lib/actions/account/link-google-account";
import { googleLinkSchema } from "@/validations/google-link";

type ActionPayload = {
  credential: string;
  currentPassword: string;
};

export function GoogleLinkDialogButton({ disabled }: { disabled: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={disabled}
        >
          Googleアカウントを連携
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xs sm:max-w-sm">
        <GoogleLinkForm onOpenChange={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

function GoogleLinkForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors: clientErrors, isValid },
  } = useForm({
    resolver: zodResolver(googleLinkSchema),
    mode: "onChange",
  });

  const [_state, action, isPending] = useActionState(
    async (
      prevState: ActionState,
      { credential, currentPassword }: ActionPayload,
    ) => {
      const nextState = await linkGoogleAccount(
        credential,
        currentPassword,
        prevState,
      );

      if (nextState.success) {
        startTransition(() => {
          onOpenChange(false);
        });

        return nextState;
      }

      if (nextState.message) {
        setError("currentPassword", {
          type: "server",
          message: nextState.message,
        });
      }

      return nextState;
    },
    {
      success: false,
    },
  );

  const handleCredential = (credential: string) => {
    handleSubmit(({ currentPassword }) => {
      startTransition(() => {
        action({
          credential,
          currentPassword,
        });
      });
    })();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center">
          Googleアカウントを連携
        </DialogTitle>

        <p className="my-4 text-left text-sm text-muted-foreground">
          現在のパスワードを入力してから、
          連携するGoogleアカウントを選択してください。
        </p>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="google-link-password">現在のパスワード</Label>

        <Input
          id="google-link-password"
          {...register("currentPassword")}
          type="password"
          placeholder="6文字以上半角英数字"
          aria-invalid={!!clientErrors.currentPassword?.message}
          required
        />

        {clientErrors.currentPassword?.message && (
          <p className="text-sm text-red-500">
            {clientErrors.currentPassword.message}
          </p>
        )}
      </div>

      <div
        className={
          !isValid || isPending ? "pointer-events-none opacity-50" : undefined
        }
      >
        <GoogleButton text="continue_with" onCredential={handleCredential} />
      </div>

      {isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Googleアカウントを連携しています
        </div>
      )}
    </>
  );
}

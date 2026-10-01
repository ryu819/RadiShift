"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { Form, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type ActionState,
  unlinkGoogleAccount,
} from "@/lib/actions/account/unlink-google-account";
import { googleLinkSchema } from "@/validations/google-link";

export function GoogleUnlinkDialogButton({ disabled }: { disabled: boolean }) {
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
          Google連携を解除
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xs sm:max-w-sm">
        <GoogleUnlinkForm onOpenChange={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

function GoogleUnlinkForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const {
    register,
    control,
    setError,
    formState: { errors: clientErrors, isValid },
  } = useForm({
    resolver: zodResolver(googleLinkSchema),
    mode: "onChange",
  });

  const [_state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = await unlinkGoogleAccount(prevState, formData);

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

  return (
    <Form
      control={control}
      onSubmit={({ formData }) =>
        startTransition(() => {
          formAction(formData);
        })
      }
    >
      <DialogHeader>
        <DialogTitle className="text-center">Google連携を解除</DialogTitle>

        <p className="my-4 text-left text-sm text-muted-foreground">
          本人確認のため、現在のパスワードを入力してください。
        </p>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="google-unlink-password">現在のパスワード</Label>

        <Input
          id="google-unlink-password"
          {...register("currentPassword")}
          name="currentPassword"
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

      <DialogFooter>
        <Button
          type="submit"
          variant="destructive"
          className="mt-5 w-full"
          disabled={isPending || !isValid}
        >
          {isPending ? <Loader2 className="animate-spin" /> : "連携を解除"}
        </Button>
      </DialogFooter>
    </Form>
  );
}

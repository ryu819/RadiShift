"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { startTransition, useActionState } from "react";
import { Form, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/actions/request-password-reset";
import { requestPasswordResetSchema } from "@/validations/request-password-reset";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RequestPasswordResetDialog({ open, onOpenChange }: Props) {
  const [serverState, formAction, isPending] = useActionState(
    requestPasswordReset,
    {
      errors: {},
      values: {},
    },
  );

  const {
    register,
    control,
    reset,
    formState: { errors: clientErrors, isValid },
  } = useForm({
    resolver: zodResolver(requestPasswordResetSchema),
    mode: "onChange",
  });

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      reset();
    }
  };

  const currentEmail = useWatch({ control, name: "email" });

  const emailMsg =
    currentEmail === serverState.values.email
      ? serverState.errors?.email
      : clientErrors.email?.message;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <Form
          control={control}
          onSubmit={({ formData }) =>
            startTransition(() => formAction(formData))
          }
        >
          <DialogHeader className="gap-3 mb-2">
            <DialogTitle className="text-xl text-center">
              パスワード再設定
            </DialogTitle>
            <DialogDescription className="my-1">
              登録済みのメールアドレス宛に、パスワード再設定用のメールを送信します。
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-2">
            <Field className="gap-2">
              <Label htmlFor="password-reset-email">メールアドレス</Label>
              <Input
                id="password-reset-email"
                {...register("email")}
                name="email"
                type="email"
                placeholder="radishift@example.com"
              />
              {emailMsg && <p className="text-red-500 text-sm">{emailMsg}</p>}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="submit"
              className="mt-5 text-md w-full"
              disabled={isPending || !isValid}
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "パスワード再設定を送信"
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

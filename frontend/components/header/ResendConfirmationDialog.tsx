"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { startTransition, useActionState } from "react";
import { Form, useForm } from "react-hook-form";

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
import {
  ActionState,
  resendConfirmation,
} from "@/lib/actions/auth/resend-confirmation";
import { resendConfirmationSchema } from "@/validations/resend-confirmation";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ResendConfirmationDialog({ open, onOpenChange }: Props) {
  const {
    register,
    control,
    reset,
    formState: { errors: clientErrors, isValid },
  } = useForm({
    resolver: zodResolver(resendConfirmationSchema),
    mode: "onChange",
  });

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      reset();
    }
  };

  const [, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = await resendConfirmation(prevState, formData);

      if (nextState.success) {
        startTransition(() => {
          handleOpenChange(false);
        });
      }

      return nextState;
    },
    {
      success: false,
      values: {},
    },
  );

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
              認証メールの再送
            </DialogTitle>
            <DialogDescription className="my-1">
              登録したメールアドレス宛に、認証メールを再送します。
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-2">
            <Field className="gap-2">
              <Label htmlFor="resend-confirmation-email">メールアドレス</Label>
              <Input
                id="resend-confirmation-email"
                {...register("email")}
                name="email"
                type="email"
                placeholder="radishift@example.com"
              />
              {clientErrors.email?.message && (
                <p className="text-red-500 text-sm">
                  {clientErrors.email.message}
                </p>
              )}
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
                "認証メールを再送する"
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

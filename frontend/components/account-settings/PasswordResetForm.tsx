"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { startTransition, useActionState, useEffect } from "react";
import { Form, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitPasswordResetForm } from "@/lib/actions/auth/password-reset";
import { passwordResetSchema } from "@/validations/password-reset";

export function PasswordResetForm({
  resetPasswordToken,
}: {
  resetPasswordToken?: string;
}) {
  const [serverState, formAction, isPending] = useActionState(
    submitPasswordResetForm,
    {
      errors: {},
    },
  );

  const {
    register,
    control,
    reset,
    formState: { errors: clientErrors, isValid },
  } = useForm({
    resolver: zodResolver(passwordResetSchema),
    mode: "onChange",
  });

  useEffect(() => {
    reset();
  }, [reset]);

  const passwordMsg =
    clientErrors.password?.message ?? serverState.errors?.password;
  const passwordConfirmationMsg =
    clientErrors.passwordConfirmation?.message ??
    serverState.errors?.passwordConfirmation;
  const tokenMsg =
    serverState.errors?.resetPasswordToken &&
    "パスワード再設定リンクが無効、または期限切れです";

  return (
    <Form
      control={control}
      onSubmit={({ formData }) => startTransition(() => formAction(formData))}
    >
      <FieldGroup className="gap-4">
        <Field className="gap-3">
          <Label htmlFor="password">パスワード</Label>
          <Input
            id="password"
            {...register("password")}
            name="password"
            type="password"
            placeholder="6文字以上半角英数字"
            aria-invalid={!!passwordMsg}
            required
          />
          {passwordMsg && <p className="text-red-500 text-sm">{passwordMsg}</p>}
        </Field>
        <Field className="gap-3">
          <Label htmlFor="passwordConfirmation">パスワード (確認用)</Label>
          <Input
            id="passwordConfirmation"
            {...register("passwordConfirmation")}
            name="passwordConfirmation"
            type="password"
            placeholder="パスワード再入力"
            aria-invalid={!!passwordConfirmationMsg}
            required
          />
          {passwordConfirmationMsg && (
            <p className="text-red-500 text-sm">{passwordConfirmationMsg}</p>
          )}
        </Field>
      </FieldGroup>
      <Input
        type="hidden"
        {...register("resetPasswordToken")}
        name="resetPasswordToken"
        value={resetPasswordToken}
      />
      {tokenMsg && <p className="text-red-500 text-sm mt-3">{tokenMsg}</p>}

      <Button
        type="submit"
        className="mt-5 text-md w-full"
        disabled={isPending || !isValid}
      >
        {isPending ? <Loader2 className="animate-spin" /> : "更新"}
      </Button>
    </Form>
  );
}

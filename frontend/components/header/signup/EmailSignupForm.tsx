"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { startTransition, useActionState } from "react";
import { Form, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ActionState, submitSignupForm } from "@/lib/actions/auth/signup";
import { signupSchema } from "@/validations/signup";

export function EmailSignupForm({ onClose }: { onClose: () => void }) {
  const [serverState, formAction, isPending] = useActionState(
    async (previousState: ActionState, formData: FormData) => {
      const nextState = await submitSignupForm(previousState, formData);

      if (nextState.success) {
        startTransition(() => {
          onClose();
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

  const {
    register,
    control,
    formState: { errors: clientErrors, isValid },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const currentEmail = useWatch({
    control,
    name: "email",
  });

  const nameMsg =
    clientErrors.name?.message ?? serverState.errors?.name?.join("、");

  const emailMsg =
    currentEmail === serverState.values.email
      ? serverState.errors?.email?.join("、")
      : clientErrors.email?.message;

  const passwordMsg =
    clientErrors.password?.message ?? serverState.errors?.password?.join("、");

  const passwordConfirmationMsg =
    clientErrors.passwordConfirmation?.message ??
    serverState.errors?.passwordConfirmation?.join("、");

  return (
    <Form
      control={control}
      onSubmit={({ formData }) =>
        startTransition(() => {
          formAction(formData);
        })
      }
    >
      <FieldGroup className="gap-2">
        <Field className="gap-2">
          <Label htmlFor="name">ユーザー名</Label>

          <Input
            id="name"
            {...register("name")}
            name="name"
            placeholder="放射 太郎"
            aria-invalid={!!nameMsg}
            required
          />

          {nameMsg && <p className="text-sm text-red-500">{nameMsg}</p>}
        </Field>

        <Field className="gap-2">
          <Label htmlFor="email">メールアドレス</Label>

          <Input
            id="email"
            {...register("email")}
            name="email"
            type="email"
            placeholder="radishift@example.com"
            aria-invalid={!!emailMsg}
            required
          />

          {emailMsg && <p className="text-sm text-red-500">{emailMsg}</p>}
        </Field>

        <Field className="gap-2">
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

          {passwordMsg && <p className="text-sm text-red-500">{passwordMsg}</p>}
        </Field>

        <Field className="gap-2">
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
            <p className="text-sm text-red-500">{passwordConfirmationMsg}</p>
          )}
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button
          type="submit"
          className="mt-5 w-full text-md"
          disabled={isPending || !isValid}
        >
          {isPending ? <Loader2 className="animate-spin" /> : "登録"}
        </Button>
      </DialogFooter>
    </Form>
  );
}

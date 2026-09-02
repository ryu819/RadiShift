"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { Form, useForm, useWatch } from "react-hook-form";

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
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { ActionState, submitSignupForm } from "@/lib/actions/auth/signup";
import { signupSchema } from "@/validations/signup";

export function SignUpForm() {
  const [open, setOpen] = useState(false);

  const [serverState, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = await submitSignupForm(prevState, formData);
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

  const {
    register,
    control,
    reset,
    formState: { errors: clientErrors, isValid },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      reset();
    }
  };

  const currentEmail = useWatch({ control, name: "email" });

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>新規登録</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <Form
          control={control}
          onSubmit={({ formData }) =>
            startTransition(() => formAction(formData))
          }
        >
          <DialogHeader className="gap-3 mb-2">
            <DialogTitle className="text-xl text-center">新規登録</DialogTitle>
            <DialogDescription className="mb-2">
              <Link
                href={ROUTES.terms}
                className="text-primary underline underline-offset-2"
              >
                利用規約
              </Link>
              および
              <Link
                href={ROUTES.privacyPolicy}
                className="text-primary underline underline-offset-2"
              >
                プライバシーポリシー
              </Link>
              に同意した上で、以下の「登録」ボタンを押してください。
            </DialogDescription>
          </DialogHeader>
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
              {nameMsg && <p className="text-red-500 text-sm">{nameMsg}</p>}
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
              {emailMsg && <p className="text-red-500 text-sm">{emailMsg}</p>}
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
              {passwordMsg && (
                <p className="text-red-500 text-sm">{passwordMsg}</p>
              )}
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
                <p className="text-red-500 text-sm">
                  {passwordConfirmationMsg}
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
              {isPending ? <Loader2 className="animate-spin" /> : "登録"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

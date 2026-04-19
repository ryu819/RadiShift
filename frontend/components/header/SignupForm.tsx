"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { submitSignupForm } from "@/lib/actions/signup";
import { signupSchema } from "@/validations/signup";

export function SignUpForm() {
  const [serverState, formAction, isPending] = useActionState(
    submitSignupForm,
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
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const [open, setOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      reset();
    }
  };

  const currentEmail = useWatch({ control, name: "email" });

  const nameMsg = clientErrors.name?.message ?? serverState.errors.name;
  const emailMsg =
    currentEmail === serverState.values.email
      ? serverState.errors.email
      : clientErrors.email?.message;
  const passwordMsg =
    clientErrors.password?.message ?? serverState.errors.password;
  const passwordConfirmationMsg =
    clientErrors.passwordConfirmation?.message ??
    serverState.errors.passwordConfirmation;

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
              利用規約およびプライバシーポリシーに同意した上で、以下の「登録」ボタンを押してください。
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
                placeholder="6文字以上半角英数字のみ"
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

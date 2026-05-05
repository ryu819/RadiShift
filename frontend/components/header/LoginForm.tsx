"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { Form, useForm } from "react-hook-form";

import { RequestPasswordResetDialog } from "@/components/header/RequestPasswordResetDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitLoginForm } from "@/lib/actions/login";
import { loginSchema } from "@/validations/login";

export function LoginForm() {
  const [_serverState, formAction, isPending] = useActionState(
    submitLoginForm,
    {
      values: {},
    },
  );

  const {
    register,
    control,
    reset,
    formState: { errors: clientErrors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const [loginOpen, setLoginOpen] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);

  const handleLoginOpenChange = (nextOpen: boolean) => {
    setLoginOpen(nextOpen);

    if (!nextOpen) {
      reset();
    }
  };

  const openPasswordResetDialog = () => {
    setLoginOpen(false);
    setPasswordResetOpen(true);
  };

  return (
    <>
      <Dialog open={loginOpen} onOpenChange={handleLoginOpenChange}>
        <DialogTrigger asChild>
          <Button>ログイン</Button>
        </DialogTrigger>

        <DialogContent className="max-w-xs sm:max-w-sm">
          <Form
            control={control}
            onSubmit={({ formData }) =>
              startTransition(() => formAction(formData))
            }
          >
            <DialogHeader className="gap-3 mb-2">
              <DialogTitle className="text-xl text-center">
                ログイン
              </DialogTitle>
            </DialogHeader>

            <FieldGroup className="gap-2">
              <Field className="gap-2">
                <Label htmlFor="login-email">メールアドレス</Label>
                <Input
                  id="login-email"
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

              <Field className="gap-2">
                <Label htmlFor="login-password">パスワード</Label>
                <Input
                  id="login-password"
                  {...register("password")}
                  name="password"
                  type="password"
                  placeholder="6文字以上半角英数字"
                />
                {clientErrors.password?.message && (
                  <p className="text-red-500 text-sm">
                    {clientErrors.password.message}
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
                {isPending ? <Loader2 className="animate-spin" /> : "ログイン"}
              </Button>
            </DialogFooter>

            <div className="text-center mt-4">
              パスワードをお忘れの方は
              <button
                type="button"
                onClick={openPasswordResetDialog}
                className="text-primary underline hover:opacity-50 transition cursor-pointer"
              >
                こちら
              </button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>

      <RequestPasswordResetDialog
        open={passwordResetOpen}
        onOpenChange={setPasswordResetOpen}
      />
    </>
  );
}

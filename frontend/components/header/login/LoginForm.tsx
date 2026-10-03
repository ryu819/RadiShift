"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { Form, useForm } from "react-hook-form";

import { GoogleLogin } from "@/components/header/login/GoogleLogin";
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
import { submitLoginForm } from "@/lib/actions/auth/login";
import { loginSchema } from "@/validations/login";

export function LoginForm({ triggerClassName }: { triggerClassName?: string }) {
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
          <Button variant="outline" className={triggerClassName}>
            ログイン
          </Button>
        </DialogTrigger>

        <DialogContent
          className="max-w-xs sm:max-w-sm"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
          }}
        >
          <DialogHeader className="mb-2 gap-3">
            <DialogTitle className="text-center text-xl">ログイン</DialogTitle>
          </DialogHeader>

          <GoogleLogin />

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-t" />

            <span className="text-sm text-muted-foreground">または</span>

            <hr className="flex-1 border-t" />
          </div>

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
                <Label htmlFor="login-email">メールアドレス</Label>

                <Input
                  id="login-email"
                  {...register("email")}
                  name="email"
                  type="email"
                  placeholder="radishift@example.com"
                  aria-invalid={!!clientErrors.email?.message}
                  required
                />

                {clientErrors.email?.message && (
                  <p className="text-sm text-red-500">
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
                  aria-invalid={!!clientErrors.password?.message}
                  required
                />

                {clientErrors.password?.message && (
                  <p className="text-sm text-red-500">
                    {clientErrors.password.message}
                  </p>
                )}
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type="submit"
                className="mt-5 w-full text-md"
                disabled={isPending || !isValid}
              >
                {isPending ? <Loader2 className="animate-spin" /> : "ログイン"}
              </Button>
            </DialogFooter>

            <div className="mt-4 text-center">
              パスワードをお忘れの方は
              <button
                type="button"
                onClick={openPasswordResetDialog}
                className="cursor-pointer text-primary underline transition hover:opacity-50"
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

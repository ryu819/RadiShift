"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { startTransition, useActionState } from "react";
import { Form, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type ActionState,
  linkGoogleSignup,
} from "@/lib/actions/auth/link-google-signup";
import { googleLinkSchema } from "@/validations/google-link";

type Props = {
  credential: string;
  email: string;
  onBack: () => void;
};

export function GoogleExistingUserForm({ credential, email, onBack }: Props) {
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
      const nextState = await linkGoogleSignup(credential, prevState, formData);

      if (nextState.message) {
        setError("currentPassword", {
          type: "server",
          message: nextState.message,
        });
      }

      return nextState;
    },
    {},
  );

  return (
    <Form
      control={control}
      onSubmit={({ formData }) =>
        startTransition(() => {
          formAction(formData);
        })
      }
      className="space-y-4"
    >
      <p className="text-sm text-muted-foreground">
        このメールアドレスのアカウントが存在します。
        本人確認のため、現在のパスワードを入力してください。
      </p>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>

        <Input id="email" value={email} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="current-password">現在のパスワード</Label>

        <Input
          id="current-password"
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

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={isPending}
        >
          戻る
        </Button>

        <Button
          type="submit"
          className="flex-1"
          disabled={isPending || !isValid}
        >
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            "連携してログイン"
          )}
        </Button>
      </div>
    </Form>
  );
}

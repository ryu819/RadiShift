"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { startTransition, useActionState } from "react";
import { Form, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type GoogleSignupActionState,
  submitGoogleSignup,
} from "@/lib/actions/auth/google-signup";
import { googleSignupSchema } from "@/validations/google-signup";

type Props = {
  credential: string;
  email: string;
  name: string;
  onBack: () => void;
};

export function GoogleNewUserForm({ credential, email, name, onBack }: Props) {
  const [state, formAction, isPending] = useActionState(
    (prevState: GoogleSignupActionState, formData: FormData) =>
      submitGoogleSignup(credential, prevState, formData),
    {},
  );

  const {
    register,
    control,
    formState: { errors: clientErrors, isValid },
  } = useForm({
    resolver: zodResolver(googleSignupSchema),
    mode: "onChange",
    defaultValues: {
      name,
    },
  });

  const nameError =
    clientErrors.name?.message ?? state.errors?.name?.join("、");

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
      <div className="space-y-2">
        <Label htmlFor="google-signup-email">メールアドレス</Label>

        <Input id="google-signup-email" value={email} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="google-signup-name">ユーザー名</Label>

        <Input
          id="google-signup-name"
          {...register("name")}
          name="name"
          placeholder="放射 太郎"
          aria-invalid={!!nameError}
          required
        />

        {nameError && <p className="text-sm text-red-500">{nameError}</p>}
      </div>

      {!nameError && state.message && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <div className="flex gap-2 mt-6">
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
          {isPending ? <Loader2 className="animate-spin" /> : "登録"}
        </Button>
      </div>
    </Form>
  );
}

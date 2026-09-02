"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { startTransition, useActionState, useEffect } from "react";
import { Form, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitAccountUpdateForm } from "@/lib/actions/account/account-update";
import { User } from "@/types/user";
import { accountUpdateSchema } from "@/validations/account-update";

export function AccountUpdateForm({ user }: { user: User | null }) {
  const [serverState, formAction, isPending] = useActionState(
    submitAccountUpdateForm,
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
    resolver: zodResolver(accountUpdateSchema),
    mode: "onChange",
  });

  useEffect(() => {
    reset();
  }, [reset]);

  const currentEmail = useWatch({ control, name: "email" });

  const nameMsg = clientErrors.name?.message ?? serverState.errors?.name;
  const emailMsg =
    currentEmail === serverState.values.email
      ? serverState.errors?.email
      : clientErrors.email?.message;

  return (
    <Form
      control={control}
      onSubmit={({ formData }) => startTransition(() => formAction(formData))}
    >
      <FieldGroup className="gap-4">
        <Field className="gap-3">
          <Label htmlFor="name">ユーザー名</Label>
          <Input
            id="name"
            {...register("name")}
            name="name"
            defaultValue={user?.name}
            aria-invalid={!!nameMsg}
            required
          />
          {nameMsg && <p className="text-red-500 text-sm">{nameMsg}</p>}
        </Field>
        <Field className="gap-3">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            {...register("email")}
            name="email"
            type="email"
            defaultValue={user?.email}
            aria-invalid={!!emailMsg}
            required
          />
          {emailMsg && <p className="text-red-500 text-sm">{emailMsg}</p>}
        </Field>
      </FieldGroup>
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

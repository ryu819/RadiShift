"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";

import { GoogleButton } from "@/components/google-auth/GoogleButton";
import { EmailSignupForm } from "@/components/header/signup/EmailSignupForm";
import { GoogleExistingUserForm } from "@/components/header/signup/GoogleExistingUserForm";
import { GoogleNewUserForm } from "@/components/header/signup/GoogleNewUserForm";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";
import { checkGoogleSignup } from "@/lib/actions/auth/check-google-signup";

export function SignupContent({
  onClose,
  onOpenResendConfirmation,
}: {
  onClose: () => void;
  onOpenResendConfirmation: () => void;
}) {
  const [credential, setCredential] = useState<string | null>(null);

  const [state, action, isPending] = useActionState(checkGoogleSignup, {
    success: false,
  });

  const handleGoogleCredential = (credential: string) => {
    setCredential(credential);

    startTransition(() => {
      action(credential);
    });
  };

  const handleBack = () => {
    setCredential(null);
  };

  const isNewUser =
    !isPending && !!credential && state.success && state.status === "new_user";

  const isExistingUser =
    !isPending &&
    !!credential &&
    state.success &&
    state.status === "existing_user";

  return (
    <>
      <DialogHeader className="mb-2 gap-3">
        <DialogTitle className="text-center text-xl">
          {isExistingUser ? "Googleアカウントを連携" : "新規登録"}
        </DialogTitle>

        {!isExistingUser && (
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
            に同意した上で登録してください。
          </DialogDescription>
        )}
      </DialogHeader>

      {isNewUser && (
        <GoogleNewUserForm
          credential={credential}
          email={state.email ?? ""}
          name={state.name ?? ""}
          onBack={handleBack}
        />
      )}

      {isExistingUser && credential && (
        <GoogleExistingUserForm
          credential={credential}
          email={state.email ?? ""}
          onBack={handleBack}
        />
      )}

      {!isNewUser && !isExistingUser && (
        <>
          <GoogleButton
            text="signup_with"
            onCredential={handleGoogleCredential}
          />

          {isPending && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Google認証を確認しています
            </div>
          )}

          {!isPending && state.message && (
            <p className="text-center text-sm text-red-500">{state.message}</p>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t" />

            <span className="text-sm text-muted-foreground">または</span>

            <div className="flex-1 border-t" />
          </div>

          <EmailSignupForm onClose={onClose} />

          <div className="text-center text-sm">
            新規会員登録後の認証メールが届かない方は
            <button
              type="button"
              onClick={onOpenResendConfirmation}
              className="cursor-pointer text-primary underline transition hover:opacity-50"
            >
              こちら
            </button>
          </div>
        </>
      )}
    </>
  );
}

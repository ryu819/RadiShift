"use client";

import { Loader2 } from "lucide-react";
import { startTransition, useActionState } from "react";

import { GoogleButton } from "@/components/google-auth/GoogleButton";
import { submitGoogleLogin } from "@/lib/actions/auth/google-login";

export function GoogleLogin() {
  const [state, action, isPending] = useActionState(submitGoogleLogin, {});

  const handleCredential = (credential: string) => {
    startTransition(() => {
      action(credential);
    });
  };

  return (
    <>
      <GoogleButton text="signin_with" onCredential={handleCredential} />

      {isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Google認証を確認しています
        </div>
      )}

      {!isPending && state.message && (
        <p className="text-center text-sm text-red-500">{state.message}</p>
      )}
    </>
  );
}

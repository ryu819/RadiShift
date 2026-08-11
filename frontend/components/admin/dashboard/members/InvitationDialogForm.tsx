"use client";

import { Check, Copy, KeyRound, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createFacilityInvitationForm } from "@/lib/actions/create-facility-invitation";
import { FacilityInvitation } from "@/types/facility-invitation";

function formatExpirationDate(date: string | null | undefined) {
  if (!date) return "未設定";

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function InvitationDialogForm({
  invitation,
}: {
  invitation: FacilityInvitation | null;
}) {
  const [state, formAction, isPending] = useActionState(
    createFacilityInvitationForm,
    { invitation, error: "" },
  );

  const inviteCode = state.invitation?.inviteCode;

  const inviteExpiresAt = state.invitation?.inviteExpiresAt;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const isCopied = copiedCode === inviteCode;

  const handleCopy = async () => {
    if (!inviteCode) return;

    await navigator.clipboard.writeText(inviteCode);

    setCopiedCode(inviteCode);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="max-sm:text-xs">メンバーを招待</Button>
      </DialogTrigger>

      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            メンバーを招待
          </DialogTitle>
        </DialogHeader>

        {inviteCode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">招待コード</p>

              <div className="relative flex items-center justify-center rounded-lg border bg-muted/40 p-2">
                <span className="text-lg font-semibold ">{inviteCode}</span>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-2"
                  onClick={handleCopy}
                >
                  {isCopied ? <Check /> : <Copy />}
                </Button>
              </div>

              {isCopied && (
                <p className="text-right text-xs text-muted-foreground">
                  コピーしました
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                有効期限：
                {formatExpirationDate(inviteExpiresAt)}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/40 p-5 flex justify-center items-center gap-2">
            <KeyRound className="size-4 text-primary" />

            <p className="text-sm font-medium">
              招待コードはまだ発行されていません
            </p>
          </div>
        )}

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <form action={formAction}>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : inviteCode ? (
                "再発行"
              ) : (
                "招待コードを発行"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { APP_TIME_ZONE } from "@/constants/time-zone";
import { createFacilityInvitationForm } from "@/lib/actions/create-facility-invitation";
import { dayjs } from "@/lib/dayjs";
import { FacilityInvitation } from "@/types/facility-invitation";

function formatExpirationDate(date: string | null | undefined) {
  if (!date) return "未設定";

  return dayjs(date).tz(APP_TIME_ZONE).format("YYYY年M月D日");
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

  const [open, setOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setCopiedCode(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

              <div className="relative flex items-center justify-center rounded-lg border bg-muted/30 p-2">
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
          <div className="rounded-lg border bg-muted/30 p-5 flex justify-center items-center gap-2">
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

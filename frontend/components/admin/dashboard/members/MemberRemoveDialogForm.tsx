"use client";

import { Loader2 } from "lucide-react";
import { startTransition, useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ActionState,
  removeMemberForm,
} from "@/lib/actions/members/remove-member";
import { Member } from "@/types/member";

type Props = {
  member: Member;
  onOpenChange: (open: boolean) => void;
};

export function MemberRemoveDialogForm({ member, onOpenChange }: Props) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = await removeMemberForm(prevState, formData);
      if (nextState.success) {
        startTransition(() => {
          onOpenChange(false);
        });
      }

      return nextState;
    },
    {
      success: false,
      error: "",
    },
  );

  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            施設から脱退
          </DialogTitle>

          <p className="my-1 text-left">
            {member.name}
            さんをこの施設から脱退させます。
            この操作は取り消せません。本当に施設を脱退させてもよろしいですか？
          </p>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Checkbox
            id="deleteAgreement"
            checked={isAgreed}
            onCheckedChange={(checked) => setIsAgreed(checked === true)}
          />
          <label htmlFor="deleteAgreement" className="text-sm">
            内容を確認し、施設から脱退させます
          </label>
        </div>

        <form action={formAction}>
          <input type="hidden" name="memberId" value={member.id} />

          {state.error && (
            <p className="mb-4 text-sm text-red-500">{state.error}</p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              variant="destructive"
              disabled={!isAgreed || isPending}
              className="w-full"
            >
              {isPending ? <Loader2 className="animate-spin" /> : "脱退させる"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

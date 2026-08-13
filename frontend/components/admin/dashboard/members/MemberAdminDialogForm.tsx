"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ActionState,
  addMemberAdminForm,
} from "@/lib/actions/add-member-admin";
import { removeMemberAdminForm } from "@/lib/actions/remove-member-admin";
import { Member } from "@/types/member";

type Props = {
  member: Member;
  actionType: "add" | "remove";
  onOpenChange: (open: boolean) => void;
};

export function MemberAdminDialogForm({
  member,
  actionType,
  onOpenChange,
}: Props) {
  const action =
    actionType === "add" ? addMemberAdminForm : removeMemberAdminForm;

  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = await action(prevState, formData);
      if (nextState.success) {
        onOpenChange(false);
        router.refresh();
      }

      return nextState;
    },
    {
      success: false,
      error: "",
    },
  );

  const isAdd = actionType === "add";

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {isAdd
              ? "管理者権限を付与しますか？"
              : "管理者権限を解除しますか？"}
          </DialogTitle>

          <DialogDescription>
            {isAdd
              ? `管理者になると、メンバーやシフトの設定・管理ができるようになります。`
              : `解除後は、メンバーやシフトの設定・管理ができなくなります。`}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction}>
          <input type="hidden" name="memberId" value={member.id} />

          {state.error && (
            <p className="mb-4 text-sm text-red-500">{state.error}</p>
          )}

          <DialogFooter className="mt-2">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : isAdd ? (
                "付与する"
              ) : (
                "解除する"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

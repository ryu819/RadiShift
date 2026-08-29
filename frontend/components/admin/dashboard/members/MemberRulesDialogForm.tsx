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
import { Textarea } from "@/components/ui/textarea";
import {
  ActionState,
  updateMemberRulesForm,
} from "@/lib/actions/members/update-member-rules";
import { Member } from "@/types/member";

type Props = {
  member: Member;
  onOpenChange: (open: boolean) => void;
};

export function MemberRulesDialogForm({ member, onOpenChange }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = await updateMemberRulesForm(prevState, formData);

      if (nextState.success) {
        onOpenChange(false);
        router.refresh();
      }

      return nextState;
    },
    { success: false, errors: {} },
  );

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            個別ルールを編集
          </DialogTitle>

          <DialogDescription>
            {member.name}さんのシフト作成時に考慮するルールを記載します。
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="memberId" value={member.id} />
          <Textarea
            name="rulesText"
            defaultValue={member.rulesText ?? ""}
            placeholder="例：月曜日は夜勤不可、夜勤は月3回まで"
          />
          {state.errors?.rulesText && (
            <p className="text-sm text-red-500">{state.errors.rulesText}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="animate-spin" /> : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

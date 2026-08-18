"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ActionState,
  createWorkTypeForm,
} from "@/lib/actions/create-work-type";
import { updateWorkTypeForm } from "@/lib/actions/update-work-type";
import type { WorkType } from "@/types/work-type";

type Props = {
  workType: WorkType | null;
  onOpenChange: (open: boolean) => void;
};

export function WorkTypeFormDialog({ workType, onOpenChange }: Props) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = workType
        ? await updateWorkTypeForm(prevState, formData)
        : await createWorkTypeForm(prevState, formData);

      if (nextState.success) {
        onOpenChange(false);
        router.refresh();
      }

      return nextState;
    },
    {
      success: false,
      errors: {},
    },
  );

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {workType ? "勤務タイプを編集" : "勤務タイプを追加"}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {workType && (
            <input type="hidden" name="workTypeId" value={workType.id} />
          )}

          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>

            <Input
              id="name"
              name="name"
              defaultValue={workType?.name}
              placeholder="例：日勤"
              required
            />

            {state.errors?.name && (
              <p className="text-sm text-red-500">{state.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>色</Label>
            <Input
              type="color"
              id="colorCode"
              name="colorCode"
              defaultValue={workType?.colorCode}
              required
            />

            {state.errors?.colorCode && (
              <p className="text-sm text-red-500">{state.errors.colorCode}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-sm border p-3">
            <div className="space-y-2">
              <Label htmlFor="autoApprove">自動承認</Label>

              <p className="text-xs text-muted-foreground">
                締め切り前の勤務申請を自動で承認します。
              </p>
            </div>

            <Switch
              id="autoApprove"
              name="autoApprove"
              value="true"
              defaultChecked={workType?.autoApprove ?? false}
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

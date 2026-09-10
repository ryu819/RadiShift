"use client";

import { Loader2 } from "lucide-react";
import { startTransition, useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ActionState,
  createWorkTypeForm,
} from "@/lib/actions/shift-types/create-work-type";
import { updateWorkTypeForm } from "@/lib/actions/shift-types/update-work-type";
import type { WorkType } from "@/types/work-type";

type Props = {
  workType: WorkType | null;
  onOpenChange: (open: boolean) => void;
};

export function WorkTypeFormDialog({ workType, onOpenChange }: Props) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = workType
        ? await updateWorkTypeForm(prevState, formData)
        : await createWorkTypeForm(prevState, formData);

      if (nextState.success) {
        startTransition(() => {
          onOpenChange(false);
        });
      }

      return nextState;
    },
    {
      success: false,
      errors: {},
    },
  );

  const nameError = state.errors?.name?.join("、");
  const colorCodeError = state.errors?.colorCode?.join("、");

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
              aria-invalid={!!nameError}
              required
            />

            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
          </div>

          <div className="space-y-2">
            <Label>色</Label>
            <Input
              type="color"
              id="colorCode"
              name="colorCode"
              defaultValue={workType?.colorCode}
              aria-invalid={!!colorCodeError}
              required
            />

            {colorCodeError && (
              <p className="text-sm text-red-500">{colorCodeError}</p>
            )}
          </div>
          <div className="space-y-2 ml-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isRequestable"
                name="isRequestable"
                value="true"
                defaultChecked={workType?.isRequestable}
              />

              <Label htmlFor="isRequestable">申請を許可</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              有効にすると、この勤務タイプの申請・返上申請を受け付けます
            </p>
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

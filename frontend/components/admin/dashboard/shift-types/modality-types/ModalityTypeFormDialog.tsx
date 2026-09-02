"use client";

import { Loader2 } from "lucide-react";
import { startTransition, useActionState } from "react";

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
import {
  ActionState,
  createModalityTypeForm,
} from "@/lib/actions/shift-types/create-modality-type";
import { updateModalityTypeForm } from "@/lib/actions/shift-types/update-modality-type";
import type { ModalityType } from "@/types/modality-type";

type Props = {
  modalityType: ModalityType | null;
  onOpenChange: (open: boolean) => void;
};

export function ModalityTypeFormDialog({ modalityType, onOpenChange }: Props) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = modalityType
        ? await updateModalityTypeForm(prevState, formData)
        : await createModalityTypeForm(prevState, formData);

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
            {modalityType ? "モダリティを編集" : "モダリティを追加"}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {modalityType && (
            <input
              type="hidden"
              name="modalityTypeId"
              value={modalityType.id}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>

            <Input
              id="name"
              name="name"
              defaultValue={modalityType?.name}
              placeholder="例：CT"
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
              defaultValue={modalityType?.colorCode}
              aria-invalid={!!colorCodeError}
              required
            />

            {colorCodeError && (
              <p className="text-sm text-red-500">{colorCodeError}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full mt-2" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
  createDayOffTypeForm,
} from "@/lib/actions/shift-types/create-day-off-type";
import { updateDayOffTypeForm } from "@/lib/actions/shift-types/update-day-off-type";
import type { DayOffType } from "@/types/day-off-type";

type Props = {
  dayOffType: DayOffType | null;
  onOpenChange: (open: boolean) => void;
};

export function DayOffTypeFormDialog({ dayOffType, onOpenChange }: Props) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = dayOffType
        ? await updateDayOffTypeForm(prevState, formData)
        : await createDayOffTypeForm(prevState, formData);

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
            {dayOffType ? "休みタイプを編集" : "休みタイプを追加"}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {dayOffType && (
            <input type="hidden" name="dayOffTypeId" value={dayOffType.id} />
          )}

          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>

            <Input
              id="name"
              name="name"
              defaultValue={dayOffType?.name}
              placeholder="例：休み"
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
              defaultValue={dayOffType?.colorCode}
              required
            />

            {state.errors?.colorCode && (
              <p className="text-sm text-red-500">{state.errors.colorCode}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dayOffUnit">休み日数</Label>

            <Input
              id="dayOffUnit"
              name="dayOffUnit"
              type="number"
              min="0"
              step="0.5"
              defaultValue={dayOffType?.dayOffUnit ?? 1}
              required
            />

            <p className="text-xs text-muted-foreground">
              1日休みは1、半日休みは0.5を入力します。
            </p>

            {state.errors?.dayOffUnit && (
              <p className="text-sm text-red-500">{state.errors.dayOffUnit}</p>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-sm border p-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="usesSlot">休み枠を使用</Label>

              <p className="text-xs text-muted-foreground">
                締め切り前の申請は、設定された休み枠に空きがある場合に
                自動で承認します。
              </p>
            </div>

            <Switch
              id="usesSlot"
              name="usesSlot"
              value="true"
              defaultChecked={dayOffType?.usesSlot ?? false}
              className="shrink-0"
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

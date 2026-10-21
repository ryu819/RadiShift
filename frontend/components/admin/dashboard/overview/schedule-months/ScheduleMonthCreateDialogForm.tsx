"use client";

import { Loader2 } from "lucide-react";
import { startTransition, useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ActionState,
  createScheduleMonthForm,
} from "@/lib/actions/schedule-months/create-schedule-month";

type Props = {
  year: number;
  month: number;
};

const DEFAULT_MONTHLY_DAYS_OFF = 9;

export function ScheduleMonthCreateDialogForm({ year, month }: Props) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = await createScheduleMonthForm(prevState, formData);
      if (nextState.success) {
        startTransition(() => {
          setOpen(false);
        });
      }

      return nextState;
    },
    { success: false, errors: {} },
  );

  const yearAndMonthError = [
    ...(state.errors?.year ?? []),
    ...(state.errors?.month ?? []),
  ].join("、");

  const monthlyDaysOffError = state.errors?.monthlyDaysOff?.join("、");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          シフト表を作成
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xs sm:max-w-sm">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              シフト表を作成
            </DialogTitle>
          </DialogHeader>

          <FieldGroup className="mt-4 gap-3">
            <Field className="gap-2">
              <Label htmlFor="yearAndMonth">年月</Label>

              <Input
                id="yearAndMonth"
                name="yearAndMonth"
                type="month"
                className="appearance-none"
                defaultValue={`${year}-${String(month).padStart(2, "0")}`}
                required
              />
              {yearAndMonthError && (
                <p className="text-red-500 text-sm">{yearAndMonthError}</p>
              )}
            </Field>

            <Field className="gap-2">
              <Label htmlFor="monthlyDaysOff">公休数</Label>

              <Input
                id="monthlyDaysOff"
                name="monthlyDaysOff"
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                defaultValue={DEFAULT_MONTHLY_DAYS_OFF}
                aria-invalid={!!monthlyDaysOffError}
                required
              />

              <p className="mt-1 ml-1 text-xs text-muted-foreground">
                1人あたりの公休日数を0.5日単位で設定できます
              </p>
              {monthlyDaysOffError && (
                <p className="text-red-500 text-sm">{monthlyDaysOffError}</p>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-5">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

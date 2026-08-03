"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";

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
import { createScheduleMonthForm } from "@/lib/actions/create-schedule-month";

type Props = {
  year: number;
  month: number;
};

const DEFAULT_MONTHLY_DAYS_OFF = 9;

export function CreateScheduleMonthDialogForm({ year, month }: Props) {
  const [_serverState, formAction, isPending] = useActionState(
    createScheduleMonthForm,
    {},
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          シフト月を作成
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xs sm:max-w-sm">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              シフト月を作成
            </DialogTitle>
          </DialogHeader>

          <FieldGroup className="mt-4 gap-3">
            <Field className="gap-2">
              <Label htmlFor="yearAndMonth">シフト月</Label>

              <Input
                id="yearAndMonth"
                name="yearAndMonth"
                type="month"
                defaultValue={`${year}-${String(month).padStart(2, "0")}`}
                required
              />
            </Field>

            <Field className="gap-2">
              <Label htmlFor="monthlyDaysOff">公休数</Label>

              <Input
                id="monthlyDaysOff"
                name="monthlyDaysOff"
                type="number"
                min={0}
                step={0.5}
                defaultValue={DEFAULT_MONTHLY_DAYS_OFF}
                required
              />

              <p className="mt-1 text-xs text-muted-foreground">
                0.5日単位で設定できます
              </p>
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

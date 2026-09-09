"use client";

import { Calendar, ChevronRight, Loader2, Pencil } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";

import { ScheduleMonthDeleteDialog } from "@/components/admin/dashboard/overview/schedule-months/ScheduleMonthDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ROUTES } from "@/constants/routes";
import {
  ActionState,
  updateScheduleMonthForm,
} from "@/lib/actions/schedule-months/update-schedule-month";
import type { ScheduleMonths } from "@/types/schedule-months";

type Props = {
  scheduleMonth: ScheduleMonths;
};

export function ScheduleMonthSettingsDialogForm({ scheduleMonth }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const nextState = await updateScheduleMonthForm(prevState, formData);
      if (nextState.success) {
        startTransition(() => {
          setSettingsOpen(false);
        });
      }

      return nextState;
    },
    { success: false, errors: {} },
  );

  const openDeleteDialog = () => {
    setSettingsOpen(false);

    setDeleteOpen(true);
  };

  const monthlyDaysOffError = state.errors?.monthlyDaysOff?.join("、");

  const statusError = state.errors?.status?.join("、");

  return (
    <>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border px-2 py-3 text-sm transition-colors hover:bg-muted/50 active:bg-muted/60"
          >
            <div className="font-semibold">
              {scheduleMonth.year}年 {scheduleMonth.month}月
            </div>

            {scheduleMonth.status === "accepting_requests" && (
              <Badge className="bg-amber-100 text-amber-700 rounded-sm">
                シフト未公開
              </Badge>
            )}

            {scheduleMonth.status === "published" && (
              <Badge className="bg-emerald-100 text-emerald-700 rounded-sm">
                シフト公開済
              </Badge>
            )}

            <div className="flex w-full items-center justify-center gap-1 pt-1 text-xs text-foreground transition-transform group-hover:-translate-y-0.5 group-active:-translate-y-0.5">
              <Pencil className="size-3.5" aria-hidden="true" />
              <span>編集</span>
            </div>
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-xs sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {scheduleMonth.year}年 {scheduleMonth.month}月
            </DialogTitle>
          </DialogHeader>

          <form action={formAction}>
            <input
              type="hidden"
              name="scheduleMonthId"
              value={scheduleMonth.id}
            />

            <FieldGroup className="mt-2 gap-5">
              <Field className="gap-2">
                <Label htmlFor={`monthly-days-off-${scheduleMonth.id}`}>
                  公休数
                </Label>

                <Input
                  id={`monthly-days-off-${scheduleMonth.id}`}
                  name="monthlyDaysOff"
                  type="number"
                  min={0}
                  step={0.5}
                  defaultValue={scheduleMonth.monthlyDaysOff}
                  aria-invalid={!!monthlyDaysOffError}
                  required
                />
                {monthlyDaysOffError && (
                  <p className="text-red-500 text-sm">{monthlyDaysOffError}</p>
                )}
              </Field>

              <Field className="gap-2">
                <Label htmlFor={`status-${scheduleMonth.id}`}>ステータス</Label>

                <RadioGroup
                  name="status"
                  defaultValue={scheduleMonth.status}
                  required
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      id={`status-accepting-${scheduleMonth.id}`}
                      value="accepting_requests"
                    />

                    <Label
                      htmlFor={`status-accepting-${scheduleMonth.id}`}
                      className="font-normal"
                    >
                      申請受付中
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      id={`status-published-${scheduleMonth.id}`}
                      value="published"
                    />

                    <Label
                      htmlFor={`status-published-${scheduleMonth.id}`}
                      className="font-normal"
                    >
                      シフト公開
                    </Label>
                  </div>
                </RadioGroup>
                {statusError && (
                  <p className="text-red-500 text-sm">{statusError}</p>
                )}
              </Field>
            </FieldGroup>

            <Button type="submit" disabled={isPending} className="w-full mt-5">
              {isPending ? <Loader2 className="animate-spin" /> : "変更"}
            </Button>

            <Link
              href={`${ROUTES.masterShift}?scheduleMonthId=${scheduleMonth.id}`}
              onClick={() => setSettingsOpen(false)}
              className="group mt-3 flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-muted/50 active:bg-muted/60"
            >
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />

                <div>
                  <p className="text-sm font-medium">シフト表を開く</p>
                </div>
              </div>

              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-active:translate-x-0.5" />
            </Link>
          </form>

          <div className="border-t pt-4">
            <Button
              type="button"
              variant="destructiveOutline"
              className="w-full"
              onClick={openDeleteDialog}
            >
              シフト月を削除
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ScheduleMonthDeleteDialog
        scheduleMonth={scheduleMonth}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

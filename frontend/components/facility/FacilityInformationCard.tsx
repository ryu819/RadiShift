"use client";

import { Loader2 } from "lucide-react";
import { startTransition, useActionState, useState } from "react";

import { FacilityDeleteDialog } from "@/components/facility/FacilityDeleteDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  type ActionState,
  updateFacilityForm,
} from "@/lib/actions/facility/update-facility";
import { dayjs } from "@/lib/dayjs";
import type { Facility } from "@/types/facility";

type Props = {
  facility: Facility;
  isAdmin: boolean;
};

export function FacilityInformationCard({ facility, isAdmin }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (
      prevState: ActionState,
      formData: FormData,
    ): Promise<ActionState> => {
      const nextState = await updateFacilityForm(prevState, formData);

      if (nextState.success) {
        startTransition(() => {
          setIsEditing(false);
        });
      }

      return nextState;
    },
    {
      success: false,
      errors: {},
    },
  );

  const deadlineDate = dayjs(facility.nextRequestDeadline.deadlineDate).format(
    "M月D日",
  );

  const nameError = state.errors?.name?.join("、");
  const requestDeadlineDayError = state.errors?.requestDeadlineDay?.join("、");
  const rulesTextError = state.errors?.rulesText?.join("、");

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto w-full">
      <form action={formAction}>
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">施設情報</CardTitle>

              {isAdmin && (
                <div className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        key="cancel"
                        variant="secondaryOutline"
                        size="sm"
                        disabled={isPending}
                        onClick={handleCancel}
                      >
                        キャンセル
                      </Button>

                      <Button
                        type="submit"
                        key="save"
                        size="sm"
                        className="w-14"
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "保存"
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      key="edit"
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                    >
                      編集
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="space-y-1">
              {isEditing ? (
                <Label htmlFor="name" className="text-sm font-normal ">
                  施設名
                </Label>
              ) : (
                <p className="text-sm ">施設名</p>
              )}

              <div className="flex min-h-9 items-center">
                {isEditing ? (
                  <Input
                    id="name"
                    name="name"
                    defaultValue={facility.name}
                    aria-invalid={!!nameError}
                    className="font-medium max-w-xs md:text-base"
                    required
                  />
                ) : (
                  <p className="font-medium">{facility.name}</p>
                )}
              </div>

              {isEditing && nameError && (
                <p className="text-sm text-red-500">{nameError}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-1">
              {isEditing ? (
                <Label
                  htmlFor="requestDeadlineDay"
                  className="text-sm font-normal "
                >
                  申請締切の設定
                </Label>
              ) : (
                <p className="text-sm ">申請締切の設定</p>
              )}
              <p className="text-xs text-muted-foreground">
                休み枠を使う休み希望が、自動承認される期限です
              </p>

              <div className="flex min-h-9 items-center">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">毎月</span>

                    <Input
                      id="requestDeadlineDay"
                      name="requestDeadlineDay"
                      type="number"
                      min={1}
                      max={31}
                      inputMode="numeric"
                      defaultValue={facility.requestDeadlineDay}
                      aria-invalid={!!requestDeadlineDayError}
                      className="w-15 font-medium md:text-base"
                      required
                    />

                    <span className="font-medium">日</span>
                  </div>
                ) : (
                  <p className="font-medium">
                    毎月{facility.requestDeadlineDay}日
                  </p>
                )}
              </div>

              {isEditing && requestDeadlineDayError && (
                <p className="text-sm text-red-500">
                  {requestDeadlineDayError}
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm ">
                {facility.nextRequestDeadline.month}
                月シフトの申請締切
              </p>

              <div className="flex min-h-9 items-center">
                <p className="font-medium">{deadlineDate}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              {isEditing ? (
                <Label htmlFor="rulesText" className="text-sm font-normal ">
                  施設ルール
                </Label>
              ) : (
                <p className="text-sm ">施設ルール</p>
              )}

              <div className="min-h-24">
                {isEditing ? (
                  <Textarea
                    id="rulesText"
                    name="rulesText"
                    defaultValue={facility.rulesText ?? ""}
                    aria-invalid={!!rulesTextError}
                    className="min-h-24 font-medium text-sm "
                    placeholder="施設共通のルールを入力してください"
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm font-medium">
                    {facility.rulesText || "施設ルールは設定されていません"}
                  </p>
                )}
              </div>

              {isEditing && rulesTextError && (
                <p className="text-sm text-red-500">{rulesTextError}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      {isAdmin && (
        <>
          <div className="flex items-center justify-center gap-4 text-sm text-red-400">
            <hr className="w-full border-t-2 border-red-200" />
            <span className="whitespace-nowrap">危険な操作</span>
            <hr className="w-full border-t-2 border-red-200" />
          </div>

          <div className="mx-auto w-full max-w-lg">
            <FacilityDeleteDialog facilityName={facility.name} />
          </div>
        </>
      )}
    </div>
  );
}

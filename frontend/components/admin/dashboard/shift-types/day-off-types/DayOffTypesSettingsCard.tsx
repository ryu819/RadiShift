"use client";

import { useState } from "react";

import { DayOffTypeFormDialog } from "@/components/admin/dashboard/shift-types/day-off-types/DayOffTypeFormDialog";
import { DayOffTypesActionsMenu } from "@/components/admin/dashboard/shift-types/day-off-types/DayOffTypesActionsMenu";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DayOffType } from "@/types/day-off-type";

export function DayOffTypesSettingsCard({
  dayOffTypes,
}: {
  dayOffTypes: DayOffType[];
}) {
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  return (
    <>
      <Card className="gap-4 pt-5 pb-2 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">休みタイプ</CardTitle>

          <CardAction>
            <Button
              variant="outline"
              onClick={() => {
                setFormDialogOpen(true);
              }}
            >
              追加
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="px-4">
          {dayOffTypes.length === 0 ? (
            <p className="px-6 pt-4 pb-6 text-center text-sm text-muted-foreground">
              休みタイプがありません
            </p>
          ) : (
            <div className="divide-y">
              {dayOffTypes.map((dayOffType) => (
                <div
                  key={dayOffType.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: dayOffType.colorCode }}
                      />

                      <span className="font-medium">{dayOffType.name}</span>
                    </div>

                    <p className="mt-1 pl-5 text-xs text-muted-foreground">
                      {Number(dayOffType.dayOffUnit)}日分｜
                      {dayOffType.usesSlot
                        ? "休み枠を使用"
                        : "休み枠を使用しない"}
                    </p>
                  </div>

                  <DayOffTypesActionsMenu dayOffType={dayOffType} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {formDialogOpen && (
        <DayOffTypeFormDialog
          dayOffType={null}
          onOpenChange={setFormDialogOpen}
        />
      )}
    </>
  );
}

"use client";

import { useState } from "react";

import { WorkTypeFormDialog } from "@/components/admin/dashboard/shift-types/work-types/WorkTypeFormDialog";
import { WorkTypesActionsMenu } from "@/components/admin/dashboard/shift-types/work-types/WorkTypesActionsMenu";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WorkType } from "@/types/work-type";

export function WorkTypesSettingsCard({
  workTypes,
}: {
  workTypes: WorkType[];
}) {
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  return (
    <>
      <Card className="gap-4 pt-5 pb-2 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">勤務タイプ</CardTitle>

          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFormDialogOpen(true);
              }}
            >
              追加
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="px-4">
          {workTypes.length === 0 ? (
            <p className="px-6 pt-4 pb-6 text-center text-sm text-muted-foreground">
              勤務タイプがありません
            </p>
          ) : (
            <div className="divide-y">
              {workTypes.map((workType) => (
                <div
                  key={workType.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: workType.colorCode }}
                      />

                      <span className="font-medium">{workType.name}</span>
                    </div>

                    <p className="mt-1 pl-5 text-xs text-muted-foreground">
                      {workType.isRequestable ? "申請可" : "申請不可"}
                    </p>
                  </div>

                  <WorkTypesActionsMenu workType={workType} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {formDialogOpen && (
        <WorkTypeFormDialog workType={null} onOpenChange={setFormDialogOpen} />
      )}
    </>
  );
}

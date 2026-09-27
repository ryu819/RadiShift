"use client";

import { useState } from "react";

import { ModalityTypeFormDialog } from "@/components/admin/dashboard/shift-types/modality-types/ModalityTypeFormDialog";
import { ModalityTypesActionsMenu } from "@/components/admin/dashboard/shift-types/modality-types/ModalityTypesActionsMenu";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ModalityType } from "@/types/modality-type";

export function ModalityTypesSettingsCard({
  modalityTypes,
}: {
  modalityTypes: ModalityType[];
}) {
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  return (
    <>
      <Card className="gap-4 pt-5 pb-2 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">モダリティ</CardTitle>

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
          {modalityTypes.length === 0 ? (
            <p className="px-6 pt-4 pb-6 text-center text-sm text-muted-foreground">
              右上の「追加」からモダリティを作成してください
            </p>
          ) : (
            <div className="divide-y">
              {modalityTypes.map((modalityType) => (
                <div
                  key={modalityType.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex  items-center gap-2">
                    <span
                      className="size-3 rounded-full shrink-0"
                      style={{
                        backgroundColor: modalityType.colorCode,
                      }}
                    />

                    <span className="font-medium">{modalityType.name}</span>
                  </div>

                  <ModalityTypesActionsMenu modalityType={modalityType} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {formDialogOpen && (
        <ModalityTypeFormDialog
          modalityType={null}
          onOpenChange={setFormDialogOpen}
        />
      )}
    </>
  );
}

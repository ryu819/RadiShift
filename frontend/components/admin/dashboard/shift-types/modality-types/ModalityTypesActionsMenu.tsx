"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { ModalityTypeDeleteDialog } from "@/components/admin/dashboard/shift-types/modality-types/ModalityTypeDeleteDialog";
import { ModalityTypeFormDialog } from "@/components/admin/dashboard/shift-types/modality-types/ModalityTypeFormDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModalityType } from "@/types/modality-type";

export function ModalityTypesActionsMenu({
  modalityType,
}: {
  modalityType: ModalityType;
}) {
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center" className="min-w-fit">
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => {
              setFormDialogOpen(true);
            }}
          >
            <Pencil />
            編集
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer"
            variant="destructive"
            onSelect={() => {
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {formDialogOpen && (
        <ModalityTypeFormDialog
          modalityType={modalityType}
          onOpenChange={setFormDialogOpen}
        />
      )}

      {deleteDialogOpen && (
        <ModalityTypeDeleteDialog
          modalityType={modalityType}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );
}

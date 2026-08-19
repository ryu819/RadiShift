"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { WorkTypeDeleteDialog } from "@/components/admin/dashboard/shift-types/work-types/WorkTypeDeleteDialog";
import { WorkTypeFormDialog } from "@/components/admin/dashboard/shift-types/work-types/WorkTypeFormDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkType } from "@/types/work-type";

export function WorkTypesActionsMenu({ workType }: { workType: WorkType }) {
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
        <WorkTypeFormDialog
          workType={workType}
          onOpenChange={setFormDialogOpen}
        />
      )}

      {deleteDialogOpen && (
        <WorkTypeDeleteDialog
          workType={workType}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );
}

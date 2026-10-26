"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { DayOffTypeDeleteDialog } from "@/components/admin/dashboard/shift-types/day-off-types/DayOffTypeDeleteDialog";
import { DayOffTypeFormDialog } from "@/components/admin/dashboard/shift-types/day-off-types/DayOffTypeFormDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DayOffType } from "@/types/day-off-type";

export function DayOffTypesActionsMenu({
  dayOffType,
}: {
  dayOffType: DayOffType;
}) {
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  return (
    <>
      <DropdownMenu modal={false}>
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
        <DayOffTypeFormDialog
          dayOffType={dayOffType}
          onOpenChange={setFormDialogOpen}
        />
      )}

      {deleteDialogOpen && (
        <DayOffTypeDeleteDialog
          dayOffType={dayOffType}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );
}

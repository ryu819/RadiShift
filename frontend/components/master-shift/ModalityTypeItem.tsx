"use client";
import { Loader2, Plus, X } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { createModalityAssignmentForm } from "@/lib/actions/shift-assignments/create-modality-assignment";
import { deleteModalityAssignmentForm } from "@/lib/actions/shift-assignments/delete-modality-assignment";
import { cn } from "@/lib/utils";
import type { ModalityAssignment } from "@/types/modality-assignment";
import type { ModalityType } from "@/types/modality-type";

type Props = {
  modalityType: ModalityType;
  selectedModalityAssignment?: ModalityAssignment;
  scheduleDayId: number;
  userId: number;
};

export function ModalityTypeItem({
  modalityType,
  selectedModalityAssignment,
  scheduleDayId,
  userId,
}: Props) {
  const [_createState, createFormAction, isCreating] = useActionState(
    createModalityAssignmentForm,
    {},
  );

  const [_deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteModalityAssignmentForm,
    {},
  );

  const isSelected = selectedModalityAssignment !== undefined;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{
            backgroundColor: modalityType.colorCode,
          }}
        />

        <span
          className={cn(
            "font-medium text-secondary truncate",
            isSelected && "text-primary hover:text-primary",
          )}
        >
          {modalityType.name}
        </span>
      </div>

      {selectedModalityAssignment ? (
        <form action={deleteFormAction}>
          <input
            type="hidden"
            name="modalityAssignmentId"
            value={selectedModalityAssignment.id}
          />

          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            disabled={isDeleting}
            className="text-secondary"
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <X className="size-4 opacity-75" />
            )}
          </Button>
        </form>
      ) : (
        <form action={createFormAction}>
          <input type="hidden" name="scheduleDayId" value={scheduleDayId} />

          <input type="hidden" name="userId" value={userId} />

          <input type="hidden" name="modalityTypeId" value={modalityType.id} />

          <Button
            type="submit"
            size="icon-sm"
            variant="ghost"
            disabled={isCreating}
            className="text-secondary"
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4 opacity-75" />
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

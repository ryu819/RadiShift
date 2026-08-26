"use client";
import { Plus, X } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { createWorkAssignmentForm } from "@/lib/actions/create-work-assignment";
import { deleteWorkAssignmentForm } from "@/lib/actions/delete-work-assignment";
import { cn } from "@/lib/utils";
import { WorkAssignment } from "@/types/work-assignment";
import { WorkType } from "@/types/work-type";

type WorkTypeItemProps = {
  workType: WorkType;
  selectedWorkAssignment?: WorkAssignment;
  scheduleDayId: number;
  userId: number;
};

export function WorkTypeItem({
  workType,
  selectedWorkAssignment,
  scheduleDayId,
  userId,
}: WorkTypeItemProps) {
  const [_createState, createFormAction, isCreating] = useActionState(
    createWorkAssignmentForm,
    {},
  );

  const [_deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteWorkAssignmentForm,
    {},
  );

  const isSelected = selectedWorkAssignment !== undefined;

  return (
    <div key={workType.id} className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: workType.colorCode,
          }}
        />
        <p
          className={cn(
            "font-medium text-secondary",
            isSelected && "text-primary hover:text-primary",
          )}
        >
          {workType.name}
        </p>
      </div>

      {selectedWorkAssignment ? (
        <form action={deleteFormAction}>
          <input
            type="hidden"
            name="workAssignmentId"
            value={selectedWorkAssignment.id}
          />
          <Button
            type="submit"
            variant="ghost"
            disabled={isDeleting}
            className="h-7 !px-1  justify-start  text-secondary "
          >
            <X className="h-4 w-4 opacity-75 " />
          </Button>
        </form>
      ) : (
        <form action={createFormAction}>
          <input type="hidden" name="scheduleDayId" value={scheduleDayId} />

          <input type="hidden" name="userId" value={userId} />

          <input type="hidden" name="workTypeId" value={workType.id} />
          <Button
            type="submit"
            variant="ghost"
            disabled={isCreating}
            className="h-7 !px-1  justify-start  text-secondary "
          >
            <Plus className="h-4 w-4 opacity-75" />
          </Button>
        </form>
      )}
    </div>
  );
}

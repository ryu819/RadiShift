"use client";
import { Loader2, Plus, X } from "lucide-react";
import { useActionState } from "react";

import { WorkAssignmentOverrideDialog } from "@/components/master-shift/WorkAssignmentOverrideDialog";
import { Button } from "@/components/ui/button";
import { createWorkAssignmentForm } from "@/lib/actions/shift-assignments/create-work-assignment";
import { deleteWorkAssignmentForm } from "@/lib/actions/shift-assignments/delete-work-assignment";
import { cn } from "@/lib/utils";
import { WorkAssignment } from "@/types/work-assignment";
import { WorkType } from "@/types/work-type";

type WorkTypeItemProps = {
  workType: WorkType;
  selectedWorkAssignment?: WorkAssignment;
  scheduleDayId: number;
  userId: number;
  memberName: string;
  year: number;
  month: number;
  day: number;
};

export function WorkTypeItem({
  workType,
  selectedWorkAssignment,
  scheduleDayId,
  userId,
  memberName,
  year,
  month,
  day,
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

  const isRequestBased =
    selectedWorkAssignment?.workRequestId !== null &&
    selectedWorkAssignment?.workRequestId !== undefined;

  return (
    <div className="flex items-center justify-between gap-2">
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
        isRequestBased ? (
          <WorkAssignmentOverrideDialog
            workAssignment={selectedWorkAssignment}
            memberName={memberName}
            year={year}
            month={month}
            day={day}
          />
        ) : (
          <form action={deleteFormAction}>
            <input
              type="hidden"
              name="workAssignmentId"
              value={selectedWorkAssignment.id}
            />

            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              disabled={isDeleting}
              className="ext-secondary"
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <X className="size-4 opacity-75" />
              )}
            </Button>
          </form>
        )
      ) : (
        <form action={createFormAction}>
          <input type="hidden" name="scheduleDayId" value={scheduleDayId} />

          <input type="hidden" name="userId" value={userId} />

          <input type="hidden" name="workTypeId" value={workType.id} />

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

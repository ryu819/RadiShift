"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useActionState } from "react";

import { DayOffAssignmentOverrideDialog } from "@/components/master-shift/DayOffAssignmentOverrideDialog";
import { Button } from "@/components/ui/button";
import { createDayOffAssignmentForm } from "@/lib/actions/shift-assignments/create-day-off-assignment";
import { deleteDayOffAssignmentForm } from "@/lib/actions/shift-assignments/delete-day-off-assignment";
import { cn } from "@/lib/utils";
import type { DayOffAssignment } from "@/types/day-off-assignment";
import type { DayOffType } from "@/types/day-off-type";

type Props = {
  dayOffType: DayOffType;
  selectedDayOffAssignment?: DayOffAssignment;
  scheduleDayId: number;
  userId: number;
  memberName: string;
  year: number;
  month: number;
  day: number;
};

export function DayOffTypeItem({
  dayOffType,
  selectedDayOffAssignment,
  scheduleDayId,
  userId,
  memberName,
  year,
  month,
  day,
}: Props) {
  const [_createState, createFormAction, isCreating] = useActionState(
    createDayOffAssignmentForm,
    {},
  );

  const [_deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteDayOffAssignmentForm,
    {},
  );

  const isSelected = selectedDayOffAssignment !== undefined;

  const isRequestBased =
    selectedDayOffAssignment?.dayOffRequestId !== null &&
    selectedDayOffAssignment?.dayOffRequestId !== undefined;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: dayOffType.colorCode,
          }}
        />

        <p
          className={cn(
            "font-medium text-secondary",
            isSelected && "text-primary hover:text-primary",
          )}
        >
          {dayOffType.name}
        </p>
      </div>

      {selectedDayOffAssignment ? (
        isRequestBased ? (
          <DayOffAssignmentOverrideDialog
            dayOffAssignment={selectedDayOffAssignment}
            memberName={memberName}
            year={year}
            month={month}
            day={day}
          />
        ) : (
          <form action={deleteFormAction}>
            <input
              type="hidden"
              name="dayOffAssignmentId"
              value={selectedDayOffAssignment.id}
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
        )
      ) : (
        <form action={createFormAction}>
          <input type="hidden" name="scheduleDayId" value={scheduleDayId} />
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="dayOffTypeId" value={dayOffType.id} />

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

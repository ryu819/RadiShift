import type { DayOffType } from "@/types/day-off-type";

export type DayOffAssignment = {
  id: number;
  scheduleDayId: number;
  userId: number;
  dayOffRequestId?: number | null;
  dayOffType: DayOffType;
};

export type DayOffAssignmentsByUserAndDay = Record<
  string,
  Record<string, DayOffAssignment[]>
>;

import { WorkType } from "@/types/work-type";

export type WorkAssignment = {
  id: number;
  scheduleDayId: number;
  userId: number;
  workRequestId?: number | null;
  workType: WorkType;
};

export type WorkAssignmentsByUserAndDay = Record<
  string,
  Record<string, WorkAssignment[]>
>;

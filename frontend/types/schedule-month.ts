import { ScheduleDay } from "@/types/schedule-day";

export type ScheduleMonth = {
  id: number;
  year: number;
  month: number;
  monthlyDaysOff: number;
  isPublished: boolean;
  scheduleDays: ScheduleDay[];
};

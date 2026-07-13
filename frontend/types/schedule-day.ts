import { DayOffSlot } from "@/types/day-off-slot";

export type ScheduleDay = {
  id: number;
  date: string;
  day: number;
  weekdayLabel: string;
  isHoliday: boolean;
  isSunday: boolean;
  isSaturday: boolean;
  dayOffSlots: DayOffSlot[];
};

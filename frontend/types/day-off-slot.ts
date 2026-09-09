import { DayOffType } from "@/types/day-off-type";

export type DayOffSlot = {
  id: number;
  scheduleDayId: number;
  dayOffTypeId: number;
  maxSlots: number;
  remainingSlots: number;
  dayOffType: DayOffType;
};

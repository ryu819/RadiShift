import type { ModalityType } from "@/types/modality-type";

export type ModalityAssignment = {
  id: number;
  scheduleDayId: number;
  userId: number;
  modalityType: ModalityType;
};

export type ModalityAssignmentsByUserAndDay = Record<
  string,
  Record<string, ModalityAssignment[]>
>;

export type ShiftDisplayVisibilityKey = "work" | "dayOff" | "modality";

export type ShiftDisplayVisibility = {
  work: boolean;
  dayOff: boolean;
  modality: boolean;
};

export type ShiftDisplayScope = "master-shifts" | "my-shifts";

export const SHIFT_DISPLAY_VISIBILITY_ITEMS: {
  key: ShiftDisplayVisibilityKey;
  label: string;
}[] = [
  {
    key: "work",
    label: "勤務",
  },
  {
    key: "dayOff",
    label: "休み",
  },
  {
    key: "modality",
    label: "モダリティ",
  },
];

export const DEFAULT_SHIFT_DISPLAY_VISIBILITY: ShiftDisplayVisibility = {
  work: true,
  dayOff: true,
  modality: true,
};

export type PendingRequest = {
  id: number;
  requestKind: "work" | "day_off";
  userName: string;
  requestedDate: string;
  requestWeekdayLabel: string;
  typeName: string;
  colorCode: string;
  createdAt: string;
  isReturn: boolean;
};

export type WorkType = {
  id: number;
  name: string;
  colorCode: string;
  isRequestable: boolean;
  nextDayWorkTypeId?: number | null;
};

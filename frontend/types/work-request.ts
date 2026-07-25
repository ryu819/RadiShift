export type WorkRequest = {
  id: number;
  userId: number;
  scheduleDayId: number;
  workTypeId: number;
  requestStatus: string;
  isReturn: boolean;
  createdAt: string;

  user?: {
    name: string;
  };

  scheduleDay: {
    date: string;
    day: number;
    weekdayLabel: string;
  };

  workType: {
    name: string;
    colorCode: string;
  };
};

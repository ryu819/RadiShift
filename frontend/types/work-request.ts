export type WorkRequest = {
  id: number;
  userId: number;
  scheduleDayId: number;
  workTypeId: number;
  requestStatus: string;
  isReturn: boolean;
  createdAt: string;

  scheduleDay: {
    date: string;
    weekdayLabel: string;
  };

  workType: {
    name: string;
    colorCode: string;
  };
};

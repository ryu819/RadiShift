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
    isHoliday: boolean;
  };

  workType: {
    name: string;
    colorCode: string;
  };
};

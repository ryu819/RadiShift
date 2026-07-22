export type DayOffRequest = {
  id: number;
  userId: number;
  scheduleDayId: number;
  dayOffTypeId: number;
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

  dayOffType: {
    name: string;
    colorCode: string;
  };
};

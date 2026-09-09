export type DayOffRequest = {
  id: number;
  userId: number;
  scheduleDayId: number;
  dayOffTypeId: number;
  requestStatus: string;
  isReturn: boolean;
  createdAt: string;

  scheduleDay: {
    date: string;
    weekdayLabel: string;
  };

  dayOffType: {
    name: string;
    colorCode: string;
  };
};

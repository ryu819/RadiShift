export type WorkAssignment = {
  id: number;
  scheduleDayId: number;
  userId: number;
  workType: {
    id: number;
    name: string;
    colorCode: string;
  };
};

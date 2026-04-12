export type User = {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  facilityId: number | null;
  rulesText: string | null;
  createdAt: string;
  updatedAt: string;
};

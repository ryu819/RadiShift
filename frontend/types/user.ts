export type User = {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  rulesText: string | null;
  facilityId: number;
  avatarImageUrl: string | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  isDemo: boolean;
  rulesText: string | null;
  facilityId: number | null;
  avatarImageUrl: string | null;
  googleEmail: string | null;
  passwordSet: boolean;
};

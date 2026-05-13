export type User = {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  rulesText: string | null;
  avatarImageUrl: string | null;
};

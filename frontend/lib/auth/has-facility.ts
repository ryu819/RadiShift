import { User } from "@/types/user";

export function hasFacility(user: User | null) {
  return !!user?.facilityId;
}

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/actions/account/get-current-user";
import { hasFacility } from "@/lib/auth/has-facility";

export async function auth() {
  const user = await getCurrentUser();

  if (!user || !hasFacility(user)) redirect("/");

  return;
}

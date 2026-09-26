import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/actions/account/get-current-user";
import { hasFacility } from "@/lib/auth/has-facility";

export async function requireFacility() {
  const user = await getCurrentUser();

  if (!hasFacility(user)) redirect("/");
}

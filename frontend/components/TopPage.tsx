import { redirect } from "next/navigation";

import { FacilityEntryPage } from "@/components/FacilityEntryPage";
import { GuestPage } from "@/components/GuestPage";
import { getCurrentUser } from "@/lib/actions/get-current-user";
import { hasFacility } from "@/lib/actions/has-facility";

export async function TopPage() {
  const user = await getCurrentUser();

  if (!user) return <GuestPage />;

  if (!hasFacility(user)) return <FacilityEntryPage />;

  redirect("/dashboard");
}

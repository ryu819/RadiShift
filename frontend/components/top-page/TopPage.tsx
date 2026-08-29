import { redirect } from "next/navigation";

import { FacilityEntryPage } from "@/components/top-page/FacilityEntryPage";
import { GuestPage } from "@/components/top-page/GuestPage";
import { ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/lib/actions/account/get-current-user";
import { hasFacility } from "@/lib/auth/has-facility";

export async function TopPage() {
  const user = await getCurrentUser();

  if (!user) return <GuestPage />;

  if (!hasFacility(user)) return <FacilityEntryPage />;

  redirect(`${ROUTES.masterShift}`);
}

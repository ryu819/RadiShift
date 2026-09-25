import { FacilityInformationCard } from "@/components/facility/FacilityInformationCard";
import { getCurrentUser } from "@/lib/actions/account/get-current-user";
import { getFacility } from "@/lib/actions/facility/get-facility";

export async function FacilityInformation() {
  const [facility, user] = await Promise.all([getFacility(), getCurrentUser()]);

  if (!facility || !user) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        施設情報を取得できませんでした
      </p>
    );
  }

  return <FacilityInformationCard facility={facility} isAdmin={user.isAdmin} />;
}

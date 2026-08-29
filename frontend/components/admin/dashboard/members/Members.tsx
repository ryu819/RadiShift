import { ShieldCheck, Users } from "lucide-react";

import { MembersTable } from "@/components/admin/dashboard/members/MembersTable";
import { Card, CardContent } from "@/components/ui/card";
import { getFacilityInvitation } from "@/lib/actions/facility/get-facility-invitation";
import { getMembers } from "@/lib/actions/members/get-members";

export async function Members() {
  const [membersData, invitation] = await Promise.all([
    getMembers(),
    getFacilityInvitation(),
  ]);
  const members = membersData ?? [];
  const adminCount = members.filter((member) => member.isAdmin).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="py-0 shadow-none">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <Users className="size-5 text-primary" />

              <span className="text-sm font-medium text-muted-foreground">
                メンバー数
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold">{members.length}</span>

              <span className="text-sm text-muted-foreground">名</span>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0 shadow-none">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-primary" />

              <span className="text-sm font-medium text-muted-foreground">
                管理者
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold">{adminCount}</span>

              <span className="text-sm text-muted-foreground">名</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <MembersTable members={members} invitation={invitation} />
    </div>
  );
}

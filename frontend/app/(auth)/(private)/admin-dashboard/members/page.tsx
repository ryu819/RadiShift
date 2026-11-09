import { Metadata } from "next";
import { Suspense } from "react";

import { Members } from "@/components/admin/dashboard/members/Members";
import { MembersSkeleton } from "@/components/admin/dashboard/members/MembersSkeleton";
import { RequireFacility } from "@/components/RequireFacility";

export const metadata: Metadata = {
  title: "メンバー",
};

export default function MembersPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RequireFacility />
      </Suspense>
      <Suspense fallback={<MembersSkeleton />}>
        <Members />
      </Suspense>
    </>
  );
}

import { Metadata } from "next";
import { Suspense } from "react";

import { Members } from "@/components/admin/dashboard/members/Members";
import { MembersSkeleton } from "@/components/admin/dashboard/members/MembersSkeleton";

export const metadata: Metadata = {
  title: "メンバー",
};

export default function MembersPage() {
  return (
    <Suspense fallback={<MembersSkeleton />}>
      <Members />
    </Suspense>
  );
}

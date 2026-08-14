import { Metadata } from "next";
import { Suspense } from "react";

import { Members } from "@/components/admin/dashboard/members/Members";

export const metadata: Metadata = {
  title: "メンバー",
};

export default function MembersPage() {
  return (
    <Suspense fallback={null}>
      <Members />;
    </Suspense>
  );
}

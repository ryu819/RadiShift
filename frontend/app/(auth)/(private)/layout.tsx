import { Suspense } from "react";

import { RequireFacility } from "@/components/RequireFacility";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <RequireFacility>{children}</RequireFacility>
    </Suspense>
  );
}

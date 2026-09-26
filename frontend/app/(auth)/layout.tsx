import { Suspense } from "react";

import { AuthShell } from "@/components/layout/AuthShell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AuthShell>{children}</AuthShell>
    </Suspense>
  );
}

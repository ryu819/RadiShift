import { Suspense } from "react";

import { Header } from "@/components/header/Header";
import { AuthShell } from "@/components/layout/AuthShell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <AuthShell>{children}</AuthShell>
      </Suspense>
    </>
  );
}

import { redirect } from "next/navigation";

import { Footer } from "@/components/footer/Footer";
import { FacilityShell } from "@/components/layout/FacilityShell";
import { getCurrentUser } from "@/lib/actions/account/get-current-user";
import { hasFacility } from "@/lib/auth/has-facility";

export async function AuthShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/");

  if (hasFacility(user)) {
    return <FacilityShell>{children}</FacilityShell>;
  }

  return (
    <>
      <main className="flex flex-1 flex-col bg-slate-50 pt-16">{children}</main>
      <Footer />
    </>
  );
}

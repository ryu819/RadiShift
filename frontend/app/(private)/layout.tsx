import { Suspense } from "react";

import { Auth } from "@/components/Auth";
import { MobileFooterNav } from "@/components/footer/MobileFooterNav";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <Auth />
      </Suspense>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset className="overflow-x-hidden h-screen bg-slate-50 pt-16 pb-16 md:pb-0">
          {children}
        </SidebarInset>
        <MobileFooterNav />
      </SidebarProvider>
    </>
  );
}

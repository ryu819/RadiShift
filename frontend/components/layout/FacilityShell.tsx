import { MobileFooterNav } from "@/components/footer/MobileFooterNav";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type Props = {
  children: React.ReactNode;
  isAdmin: boolean;
};

export function FacilityShell({ children, isAdmin }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar isAdmin={isAdmin} />

      <SidebarInset className="overflow-x-hidden h-screen bg-slate-50 pt-16 pb-16 md:pb-0">
        {children}
      </SidebarInset>

      <MobileFooterNav isAdmin={isAdmin} />
    </SidebarProvider>
  );
}

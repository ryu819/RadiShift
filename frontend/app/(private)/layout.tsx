import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center pt-16 min-h-screen">
          {children}
        </main>
      </SidebarProvider>
    </>
  );
}

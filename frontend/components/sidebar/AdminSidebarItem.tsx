import { SidebarItem } from "@/components/sidebar/SidebarItem";
import { getCurrentUser } from "@/lib/actions/get-current-user";

export async function AdminSidebarItem() {
  const user = await getCurrentUser();

  if (!user?.isAdmin) return null;

  return (
    <SidebarItem
      href="/admin-dashboard"
      icon="layoutDashboard"
      label="管理画面TOP"
    />
  );
}

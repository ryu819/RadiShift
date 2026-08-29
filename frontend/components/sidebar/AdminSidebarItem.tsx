import { SidebarItem } from "@/components/sidebar/SidebarItem";
import { ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/lib/actions/account/get-current-user";

export async function AdminSidebarItem() {
  const user = await getCurrentUser();

  if (!user?.isAdmin) return null;

  return (
    <SidebarItem
      href={`${ROUTES.adminDashboard}`}
      icon="layoutDashboard"
      label="管理画面TOP"
    />
  );
}

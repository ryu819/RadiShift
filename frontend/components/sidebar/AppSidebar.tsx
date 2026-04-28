import { SidebarItem } from "@/components/sidebar/SidebarItem";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar className="fixed top-16 left-0 z-0">
      <SidebarContent className="bg-white">
        <SidebarGroup className="mt-4">
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              <SidebarItem
                href="/dashboard"
                icon="house"
                label="ダッシュボード"
              />
              <SidebarItem href="/shifts" icon="calendar" label="シフト" />
              <SidebarItem href="/settings" icon="settings" label="設定" />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

import { Suspense } from "react";

import { AdminSidebarItem } from "@/components/sidebar/AdminSidebarItem";
import { SidebarItem } from "@/components/sidebar/SidebarItem";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar className="fixed left-0 z-0">
      <SidebarContent className="bg-white mt-16">
        <SidebarGroup className="mt-4">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarItem
                href="/overview-shift"
                icon="house"
                label="全体シフト"
              />
              <SidebarItem href="/shifts" icon="calendar" label="シフト" />
              <SidebarItem href="/settings" icon="settings" label="設定" />
              <Suspense fallback={null}>
                <AdminSidebarItem />
              </Suspense>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-white border-t">
        <SidebarMenu className="gap-0">
          <SidebarItem href="/terms" label="利用規約" />
          <SidebarItem href="/privacy-policy" label="プライバシーポリシー" />
          <SidebarItem href="/contact" label="お問い合わせ" />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

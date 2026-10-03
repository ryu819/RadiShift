import { SidebarItem } from "@/components/sidebar/SidebarItem";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Sidebar className="fixed left-0 z-0 master-shift-print-hide">
      <SidebarContent className="bg-white mt-16">
        <SidebarGroup className="mt-4">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarItem
                href={`${ROUTES.masterShift}`}
                icon="house"
                label="全体シフト"
              />
              <SidebarItem
                href={`${ROUTES.myShift}`}
                icon="calendar"
                label="マイシフト"
              />
              <SidebarItem
                href={`${ROUTES.facility}`}
                icon="building"
                label="施設情報"
              />
              <SidebarItem
                href={`${ROUTES.settings}`}
                icon="settings"
                label="アカウント設定"
              />
              {isAdmin && (
                <SidebarItem
                  href={`${ROUTES.adminDashboard}`}
                  icon="layoutDashboard"
                  label="管理画面TOP"
                />
              )}
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

import { MobileFooterNavItem } from "@/components/footer/MobileFooterNavItem";
import { MoreNavItem } from "@/components/footer/MoreNavItem";

export function MobileFooterNav() {
  return (
    <nav className="h-16 fixed bottom-0 border-t w-full bg-white  md:hidden">
      <ul className="flex items-center justify-around py-3">
        <MobileFooterNavItem
          href="/dashboard"
          icon="house"
          label="ダッシュボード"
        />
        <MobileFooterNavItem href="/shifts" icon="calendar" label="シフト" />
        <MobileFooterNavItem href="/settings" icon="settings" label="設定" />
        <MoreNavItem />
      </ul>
    </nav>
  );
}

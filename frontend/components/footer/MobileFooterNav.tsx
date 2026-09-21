import { MobileFooterNavItem } from "@/components/footer/MobileFooterNavItem";
import { MoreNavItem } from "@/components/footer/MoreNavItem";
import { ROUTES } from "@/constants/routes";

export function MobileFooterNav() {
  return (
    <nav className="h-16 fixed bottom-0 z-20  border-t border-slate-200 w-full bg-white  md:hidden">
      <ul className="flex items-center justify-around py-3">
        <MobileFooterNavItem
          href={`${ROUTES.masterShift}`}
          icon="house"
          label="全体シフト"
        />
        <MobileFooterNavItem
          href={`${ROUTES.myShift}`}
          icon="calendar"
          label="マイシフト"
        />
        <MobileFooterNavItem
          href={`${ROUTES.settings}`}
          icon="settings"
          label="設定"
        />
        <MoreNavItem />
      </ul>
    </nav>
  );
}

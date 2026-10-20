import { MobileFooterNavItem } from "@/components/footer/MobileFooterNavItem";
import { MoreNavItem } from "@/components/footer/MoreNavItem";
import { ROUTES } from "@/constants/routes";

export function MobileFooterNav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav className="h-16 fixed bottom-0 z-20  border-t border-slate-200 w-full bg-white  md:hidden landscape:max-md:hidden master-shift-print-hide master-shift-fullscreen-hide">
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
          href={`${ROUTES.facility}`}
          icon="building"
          label="施設"
        />
        {isAdmin && (
          <MobileFooterNavItem
            href={`${ROUTES.adminDashboard}`}
            icon="layoutDashboard"
            label="管理"
          />
        )}
        <MoreNavItem />
      </ul>
    </nav>
  );
}

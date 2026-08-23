"use client";
import { Calendar, House, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

type Props = {
  href: string;
  icon?: IconName;
  label: string;
};

const iconMap = {
  house: House,
  calendar: Calendar,
  settings: Settings,
  layoutDashboard: LayoutDashboard,
};

type IconName = keyof typeof iconMap;

function ItemIcon({ icon }: { icon?: IconName }) {
  if (!icon) return null;

  const Icon = iconMap[icon];
  return <Icon className="!size-5" />;
}

export function SidebarItem({ href, icon, label }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className=" hover:opacity-70 transition"
      >
        <Link href={href} className="gap-3">
          <ItemIcon icon={icon} />
          <span className="text-sm font-semibold">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

"use client";
import {
  Building2,
  Calendar,
  House,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type Props = {
  href: string;
  icon: IconName;
  label: string;
};

const iconMap = {
  house: House,
  calendar: Calendar,
  building: Building2,
  layoutDashboard: LayoutDashboard,
};

type IconName = keyof typeof iconMap;

function ItemIcon({ icon }: { icon: IconName }) {
  const Icon = iconMap[icon];
  return <Icon className="size-5" />;
}

export function MobileFooterNavItem({ href, icon, label }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li className="flex flex-1 justify-center">
      <Link
        href={href}
        className={cn(
          "flex flex-col items-center justify-center gap-2 hover:opacity-70 transition",
          isActive ? "text-primary" : "text-secondary",
        )}
      >
        <ItemIcon icon={icon} />
        <span className="text-xs font-semibold leading-none">{label}</span>
      </Link>
    </li>
  );
}

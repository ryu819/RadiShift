import {
  Building2,
  CalendarClock,
  ChevronRight,
  KeyRound,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

const facilityManagementItems = [
  {
    title: "招待コードを確認",
    description: "施設に参加するメンバーを招待します",
    href: `${ROUTES.adminMembers}`,
    icon: KeyRound,
  },
  {
    title: "申請の締切を設定",
    description: "休み希望の自動承認に使用する締切日を設定します",
    href: `${ROUTES.facility}`,
    icon: CalendarClock,
  },
  {
    title: "施設ルールの編集",
    description: "メンバーが確認する施設共通のルールを設定します",
    href: `${ROUTES.facility}`,
    icon: SlidersHorizontal,
  },
];

export function FacilityManagementCard() {
  return (
    <Card className="gap-4 py-5 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="size-5" />
          施設管理
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {facilityManagementItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-center justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/60 active:bg-muted/60"
              >
                <div className="flex gap-3 items-center">
                  <Icon className="size-5" />

                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>

                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-active:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

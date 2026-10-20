import { Settings } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { AccountSettings } from "@/components/account-settings/AccountSettings";
import { AccountSettingsSkeleton } from "@/components/account-settings/AccountSettingsSkeleton";

export const metadata: Metadata = {
  title: "アカウント設定",
};

export default function AccountSettingsPage() {
  return (
    <div className="flex flex-1 flex-col p-3 md:p-8">
      <div className="flex items-center gap-1 text-xs md:gap-2 md:text-sm h-8">
        <Settings className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span>アカウント設定</span>
      </div>
      <Suspense fallback={<AccountSettingsSkeleton />}>
        <AccountSettings />
      </Suspense>
    </div>
  );
}

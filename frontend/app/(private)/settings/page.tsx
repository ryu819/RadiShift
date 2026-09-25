import { Settings } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { AccountDeleteDialogButton } from "@/components/account-settings/AccountDeleteDialogButton";
import { AccountUpdateForm } from "@/components/account-settings/AccountUpdateForm";
import { AccountUpdateServer } from "@/components/account-settings/AccountUpdateServer";
import { LeaveFacilityDialogButton } from "@/components/account-settings/LeaveFacilityDialogButton";
import { PasswordResetDialogButton } from "@/components/account-settings/PasswordResetDialogButton";
import { UploadImageForm } from "@/components/account-settings/UploadImageForm";
import { UploadImageServer } from "@/components/account-settings/UploadImageServer";

export const metadata: Metadata = {
  title: "アカウント設定",
};

export default function AccountSettingsPage() {
  return (
    <div className="flex flex-1 flex-col p-3 md:p-8">
      <div className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
        <Settings className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span>アカウント設定</span>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="max-w-sm space-y-6">
          <h1 className="text-center text-2xl font-bold">アカウント設定</h1>

          <Suspense fallback={<UploadImageForm user={null} />}>
            <UploadImageServer />
          </Suspense>

          <Suspense fallback={<AccountUpdateForm user={null} />}>
            <AccountUpdateServer />
          </Suspense>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <hr className="w-25 border-t-2 border-slate-200" />
            <span className="whitespace-nowrap">その他の操作</span>
            <hr className="w-25 border-t-2 border-slate-200" />
          </div>

          <div className="flex justify-between">
            <PasswordResetDialogButton />
            <LeaveFacilityDialogButton />
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-red-400">
            <hr className="w-25 border-t-2 border-red-200" />
            <span className="whitespace-nowrap">危険な操作</span>
            <hr className="w-25 border-t-2 border-red-200" />
          </div>

          <div className="flex justify-center">
            <AccountDeleteDialogButton />
          </div>
        </div>
      </div>
    </div>
  );
}

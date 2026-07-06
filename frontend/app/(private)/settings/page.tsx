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
    <div className="p-4  flex flex-1 justify-center items-center">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-center">アカウント設定</h1>

        <Suspense fallback={<UploadImageForm user={null} />}>
          <UploadImageServer />
        </Suspense>

        <Suspense fallback={<AccountUpdateForm user={null} />}>
          <AccountUpdateServer />
        </Suspense>

        <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
          <hr className="w-25 border-t-2 border-slate-200" />
          その他の操作
          <hr className="w-25 border-t-2 border-slate-200" />
        </div>

        <div className="flex justify-between">
          <PasswordResetDialogButton />
          <LeaveFacilityDialogButton />
        </div>
        <div className="flex justify-center items-center gap-4 text-sm text-red-400">
          <hr className="w-25 border-t-2 border-red-200" />
          危険な操作
          <hr className="w-25 border-t-2 border-red-200" />
        </div>
        <div className="flex justify-center">
          <AccountDeleteDialogButton />
        </div>
      </div>
    </div>
  );
}

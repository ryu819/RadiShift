import { AccountDeleteDialogButton } from "@/components/account-settings/AccountDeleteDialogButton";
import { AccountUpdateForm } from "@/components/account-settings/AccountUpdateForm";
import { LeaveFacilityDialogButton } from "@/components/account-settings/LeaveFacilityDialogButton";
import { PasswordResetDialogButton } from "@/components/account-settings/PasswordResetDialogButton";
import { UploadImageForm } from "@/components/account-settings/UploadImageForm";

export function AccountSettingsSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-bold">アカウント設定</h1>

        <UploadImageForm user={null} />

        <AccountUpdateForm user={null} />

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
  );
}

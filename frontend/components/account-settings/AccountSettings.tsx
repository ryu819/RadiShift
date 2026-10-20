import { AccountDeleteDialogButton } from "@/components/account-settings/AccountDeleteDialogButton";
import { AccountUpdateForm } from "@/components/account-settings/AccountUpdateForm";
import { GoogleAccountSettings } from "@/components/account-settings/GoogleAccountSettings";
import { LeaveFacilityDialogButton } from "@/components/account-settings/LeaveFacilityDialogButton";
import { PasswordResetDialogButton } from "@/components/account-settings/PasswordResetDialogButton";
import { UploadImageForm } from "@/components/account-settings/UploadImageForm";
import { getCurrentUser } from "@/lib/actions/account/get-current-user";
import { hasFacility } from "@/lib/auth/has-facility";

export async function AccountSettings() {
  const user = await getCurrentUser();
  const belongsToFacility = hasFacility(user);

  return (
    <div className="flex flex-1 w-full items-center justify-center max-sm:mt-4">
      <div className="w-sm space-y-6">
        <h1 className="text-center text-2xl font-bold">アカウント設定</h1>

        <UploadImageForm user={user} />

        <AccountUpdateForm user={user} />

        <GoogleAccountSettings
          googleEmail={user?.googleEmail ?? null}
          passwordSet={user?.passwordSet ?? false}
        />

        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <hr className="flex-1 border-t-2 " />
          <span className="whitespace-nowrap">その他の操作</span>
          <hr className="flex-1 border-t-2 " />
        </div>

        <div
          className={
            belongsToFacility ? "flex justify-between" : "flex justify-center"
          }
        >
          <PasswordResetDialogButton passwordSet={user?.passwordSet ?? true} />

          {belongsToFacility && <LeaveFacilityDialogButton />}
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-red-400">
          <hr className="flex-1 border-t-2 border-red-200" />
          <span className="whitespace-nowrap">危険な操作</span>
          <hr className="flex-1 border-t-2 border-red-200" />
        </div>

        <div className="flex justify-center">
          <AccountDeleteDialogButton />
        </div>
      </div>
    </div>
  );
}

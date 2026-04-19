import { Suspense } from "react";

import { AccountUpdateForm } from "@/components/AccountUpdateForm";
import { AccountUpdateServer } from "@/components/AccountUpdateServer";
import { Button } from "@/components/ui/button";
import { UploadImageForm } from "@/components/UploadImageForm";
import { UploadImageServer } from "@/components/UploadImageServer";

export default function AccountSettingsPage() {
  return (
    <div className="sm:min-w-sm px-4 text-secondary space-y-6">
      <h1 className="text-2xl font-bold text-center">アカウント設定</h1>

      <Suspense fallback={<UploadImageForm user={null} />}>
        <UploadImageServer />
      </Suspense>

      <Suspense fallback={<AccountUpdateForm user={null} />}>
        <AccountUpdateServer />
      </Suspense>

      <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
        <hr className="w-25 border-t-2 border-slate-200" />
        または
        <hr className="w-25 border-t-2 border-slate-200" />
      </div>

      <div className="flex justify-between">
        <Button className="w-35" variant="outline">
          パスワード再設定
        </Button>

        <Button className="w-30" variant="destructiveOutline">
          アカウント削除
        </Button>
      </div>
    </div>
  );
}

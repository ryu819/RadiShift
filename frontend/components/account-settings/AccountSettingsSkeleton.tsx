import { Camera } from "lucide-react";

import { AccountUpdateForm } from "@/components/account-settings/AccountUpdateForm";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountSettingsSkeleton() {
  return (
    <div className="flex flex-1 w-full items-center justify-center max-sm:mt-4">
      <div className="w-sm space-y-6">
        <h1 className="text-center text-2xl font-bold">アカウント設定</h1>

        <Label
          htmlFor="avatarImage"
          className="relative w-fit mx-auto block cursor-pointer"
        >
          <Avatar className="w-24 h-24">
            <AvatarImage src={"/images/default-user-icon.png"} />
          </Avatar>

          <Button
            type="button"
            size="icon-sm"
            className="absolute bottom-0 right-0 rounded-full pointer-events-none"
          >
            <Camera />
          </Button>
        </Label>

        <AccountUpdateForm user={null} />
        <div className="space-y-3 text-center">
          <p className="font-medium">Googleアカウント</p>

          <Skeleton className="h-4 w-48 mx-auto" />

          <Skeleton className="h-9 w-full" />
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <hr className="flex-1 border-t-2" />
          <span className="whitespace-nowrap">その他の操作</span>
          <hr className="flex-1 border-t-2" />
        </div>

        <div className="flex justify-between">
          <Button type="button" className="w-35" variant="outline" disabled>
            パスワード再設定
          </Button>

          <Button
            type="button"
            className="w-30"
            variant="secondaryOutline"
            disabled
          >
            施設を脱退
          </Button>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-red-400">
          <hr className="flex-1 border-t-2 border-red-200" />
          <span className="whitespace-nowrap">危険な操作</span>
          <hr className="flex-1 border-t-2 border-red-200" />
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            className="w-30"
            variant="destructiveOutline"
            disabled
          >
            アカウント削除
          </Button>
        </div>
      </div>
    </div>
  );
}

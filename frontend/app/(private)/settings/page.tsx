import { Camera } from "lucide-react";
import { Suspense } from "react";

import { AccountUpdateForm } from "@/components/AccountUpdateForm";
import { AccountUpdateServer } from "@/components/AccountUpdateServer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountSettingsPage() {
  return (
    <div className="sm:min-w-sm px-4 text-secondary space-y-6">
      <h1 className="text-2xl font-bold text-center">アカウント設定</h1>

      <Label
        htmlFor="avatarImage"
        className="relative w-fit mx-auto block cursor-pointer"
      >
        <Avatar className="w-24 h-24">
          <AvatarImage src="/images/default-user-icon.png" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        <Button
          type="button"
          size="icon-sm"
          className="absolute bottom-0 right-0 rounded-full pointer-events-none"
        >
          <Camera />
        </Button>

        <Input
          id="avatarImage"
          name="avatarImage"
          type="file"
          className="hidden"
        />
      </Label>

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
          退会のお手続き
        </Button>
      </div>
    </div>
  );
}

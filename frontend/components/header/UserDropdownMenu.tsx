import { Building2, House, LogOutIcon, Settings } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { logout } from "@/lib/actions/auth/logout";
import { hasFacility } from "@/lib/auth/has-facility";
import { User } from "@/types/user";

export function UserDropdownMenu({ user }: { user: User | null }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={user?.avatarImageUrl ?? "/images/default-user-icon.png"}
            />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {hasFacility(user) && (
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer">
                <House />
                ホーム
              </Link>
            </DropdownMenuItem>
          )}
          {!hasFacility(user) && (
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer">
                <Building2 />
                施設登録
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href={`${ROUTES.settings}`} className="cursor-pointer">
              <Settings />
              アカウント設定
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-2 cursor-pointer"
              >
                <LogOutIcon />
                ログアウト
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

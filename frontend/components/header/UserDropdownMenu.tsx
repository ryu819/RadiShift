import { BadgeCheckIcon, LogOutIcon } from "lucide-react";
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
import { logout } from "@/lib/actions/logout";
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
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <BadgeCheckIcon />
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

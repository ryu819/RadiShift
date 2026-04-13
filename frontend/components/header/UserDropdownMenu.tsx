import { BadgeCheckIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/logout";

export function UserDropdownMenu() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/images/default-user-icon.png" alt="user" />
            <AvatarFallback>RS</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheckIcon />
            <Link href="/settings">アカウント設定</Link>
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

"use client";

import {
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  ShieldX,
  UserRoundX,
} from "lucide-react";
import { useState } from "react";

import { MemberAdminDialogForm } from "@/components/admin/dashboard/members/MemberAdminDialogForm";
import { MemberRemoveDialogForm } from "@/components/admin/dashboard/members/MemberRemoveDialogForm";
import { MemberRulesDialogForm } from "@/components/admin/dashboard/members/MemberRulesDialogForm";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Member } from "@/types/member";

export function MemberActionsMenu({ member }: { member: Member }) {
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);

  const [adminDialogOpen, setAdminDialogOpen] = useState(false);

  const [adminAction, setAdminAction] = useState<"add" | "remove">("add");

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`${member.name}の設定`}
          >
            <MoreHorizontal className="size-4 max-sm:size-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center">
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setRulesDialogOpen(true)}
          >
            <Pencil />
            個別ルールを編集
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => {
              setAdminAction(member.isAdmin ? "remove" : "add");
              setAdminDialogOpen(true);
            }}
          >
            {member.isAdmin ? <ShieldX /> : <ShieldCheck />}

            {member.isAdmin ? "管理者権限を解除" : "管理者権限を付与"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer"
            variant="destructive"
            onSelect={() => setRemoveDialogOpen(true)}
          >
            <UserRoundX />
            施設から脱退させる
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {rulesDialogOpen && (
        <MemberRulesDialogForm
          member={member}
          onOpenChange={setRulesDialogOpen}
        />
      )}

      {adminDialogOpen && (
        <MemberAdminDialogForm
          member={member}
          actionType={adminAction}
          onOpenChange={setAdminDialogOpen}
        />
      )}

      {removeDialogOpen && (
        <MemberRemoveDialogForm
          member={member}
          onOpenChange={setRemoveDialogOpen}
        />
      )}
    </>
  );
}

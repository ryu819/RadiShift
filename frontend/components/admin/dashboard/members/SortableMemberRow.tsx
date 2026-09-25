"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { GripHorizontal } from "lucide-react";

import { MemberActionsMenu } from "@/components/admin/dashboard/members/MemberActionsMenu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Member } from "@/types/member";

type Props = {
  member: Member;
  index: number;
  disabled: boolean;
};

export function SortableMemberRow({ member, index, disabled }: Props) {
  const { ref, handleRef, isDragging } = useSortable({
    id: member.id,
    index,
    disabled,
  });

  return (
    <TableRow ref={ref} className={isDragging ? "opacity-50" : undefined}>
      <TableCell className="w-10 px-0">
        <div className="flex items-center justify-center">
          <Button
            ref={handleRef}
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            className="touch-none cursor-grab active:cursor-grabbing"
          >
            <GripHorizontal className="size-4 max-sm:size-3" />
          </Button>
        </div>
      </TableCell>

      <TableCell className="px-0">
        <div className="flex items-center max-sm:justify-center gap-2">
          <Avatar className="size-7 max-sm:hidden">
            <AvatarImage
              src={member.avatarImageUrl ?? "/images/default-user-icon.png"}
            />
          </Avatar>

          <span className="font-medium max-sm:text-xs">{member.name}</span>
        </div>
      </TableCell>

      <TableCell className="px-2">
        <div className="flex items-center justify-center">
          <Badge
            variant={member.isAdmin ? "default" : "outline"}
            className="transition-none max-sm:text-[10px]"
          >
            {member.isAdmin ? "管理者" : "メンバー"}
          </Badge>
        </div>
      </TableCell>

      <TableCell className="px-0">
        <div className="flex items-center justify-center">
          <p
            className={
              member.rulesText
                ? "max-w-md whitespace-normal text-sm max-sm:text-xs "
                : "max-w-md whitespace-normal text-sm max-sm:text-xs text-muted-foreground"
            }
          >
            {member.rulesText ?? "未設定"}
          </p>
        </div>
      </TableCell>

      <TableCell className="px-0">
        <div className="flex items-center justify-center">
          <MemberActionsMenu member={member} />
        </div>
      </TableCell>
    </TableRow>
  );
}

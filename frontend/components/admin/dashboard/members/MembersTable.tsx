"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { InvitationDialogForm } from "@/components/admin/dashboard/members/InvitationDialogForm";
import { MemberActionsMenu } from "@/components/admin/dashboard/members/MemberActionsMenu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FacilityInvitation } from "@/types/facility-invitation";
import { Member } from "@/types/member";

type Props = {
  members: Member[];
  invitation: FacilityInvitation | null;
};

export function MembersTable({ members, invitation }: Props) {
  const [searchText, setSearchText] = useState("");

  const filteredMembers = members.filter((member) => {
    return member.name.includes(searchText);
  });

  return (
    <Card className="gap-0 px-3 max-sm:px-2 pt-5 pb-0 shadow-none">
      <CardHeader className="border-b px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="">所属メンバー</CardTitle>

          <div className="flex items-center justify-center gap-2">
            <InputGroup className="max-sm:hidden">
              <InputGroupInput
                placeholder="名前で検索"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />

              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
            </InputGroup>

            <InvitationDialogForm invitation={invitation} />
          </div>
        </div>

        <InputGroup className="sm:hidden mt-2">
          <InputGroupInput
            placeholder="名前で検索"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[15%] text-center px-0">名前</TableHead>

              <TableHead className="w-[15%] text-center px-0">権限</TableHead>

              <TableHead className="text-center px-0">個別ルール</TableHead>

              <TableHead className="w-[10%] px-0" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className=" px-0">
                    <div className="flex items-center max-sm:justify-center gap-2">
                      <Avatar className="size-7 max-sm:hidden">
                        <AvatarImage
                          src={
                            member.avatarImageUrl ??
                            "/images/default-user-icon.png"
                          }
                        />
                      </Avatar>

                      <span className="font-medium max-sm:text-xs">
                        {member.name}
                      </span>
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
                            ? "max-w-md whitespace-normal text-sm max-sm:text-xs"
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 p-0 py-3 text-center text-muted-foreground"
                >
                  該当するメンバーはいません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

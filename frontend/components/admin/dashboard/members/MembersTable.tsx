"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { CircleHelp, Search } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";

import { InvitationDialogForm } from "@/components/admin/dashboard/members/InvitationDialogForm";
import { SortableMemberRow } from "@/components/admin/dashboard/members/SortableMemberRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { reorderMembers } from "@/lib/actions/members/reorder-members";
import { FacilityInvitation } from "@/types/facility-invitation";
import { Member } from "@/types/member";

type Props = {
  members: Member[];
  invitation: FacilityInvitation | null;
};

export function MembersTable({ members, invitation }: Props) {
  const [searchText, setSearchText] = useState("");
  const [orderedMembers, setOrderedMembers] = useOptimistic(members);
  const [isSaving, startTransition] = useTransition();

  const filteredMembers = orderedMembers.filter((member) => {
    return member.name.includes(searchText);
  });

  const sortingDisabled = searchText.length > 0 || isSaving;

  function saveMemberOrder(nextMembers: Member[]) {
    startTransition(async () => {
      setOrderedMembers(nextMembers);

      await reorderMembers(nextMembers.map((member) => member.id));
    });
  }

  return (
    <Card className="gap-0 px-3 max-sm:px-2 pt-5 pb-0 shadow-none">
      <CardHeader className="border-b px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">所属メンバー</CardTitle>

            <Popover>
              <PopoverTrigger className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-secondary">
                <CircleHelp className="size-3" />
                使い方
              </PopoverTrigger>

              <PopoverContent
                align="start"
                sideOffset={6}
                className="w-80 space-y-1 p-3 text-secondary"
              >
                <p className="text-sm font-medium">メンバーの表示順</p>

                <ul className="list-disc space-y-1 pl-4 text-sm">
                  <li>
                    左端のハンドルをドラッグ＆ドロップすると、表示順を変更できます
                  </li>
                  <li>変更した順番は、今後の全体シフトに反映されます</li>
                  <li>公開済みのシフト月の表示順は変更されません</li>
                </ul>
              </PopoverContent>
            </Popover>
          </div>

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
        <DragDropProvider
          onDragEnd={(event) => {
            if (event.canceled || sortingDisabled) return;

            const { source } = event.operation;

            if (!isSortable(source)) return;

            const { initialIndex, index } = source;

            if (initialIndex === index) return;

            const nextMembers = [...orderedMembers];

            const [movedMember] = nextMembers.splice(initialIndex, 1);

            if (!movedMember) return;

            nextMembers.splice(index, 0, movedMember);

            saveMemberOrder(nextMembers);
          }}
        >
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 px-0" />

                <TableHead className="w-[15%] text-center px-0">名前</TableHead>

                <TableHead className="w-[15%] text-center px-0">権限</TableHead>

                <TableHead className="text-center px-0">個別ルール</TableHead>

                <TableHead className="w-[10%] px-0" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member, index) => (
                  <SortableMemberRow
                    key={member.id}
                    member={member}
                    index={index}
                    disabled={sortingDisabled}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-20 p-0 py-3 text-center text-muted-foreground"
                  >
                    該当するメンバーはいません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DragDropProvider>
      </CardContent>
    </Card>
  );
}

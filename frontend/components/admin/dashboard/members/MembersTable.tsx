"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { InvitationDialogForm } from "@/components/admin/dashboard/members/InvitationDialogForm";
import { SortableMemberRow } from "@/components/admin/dashboard/members/SortableMemberRow";
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
import { reorderMembers } from "@/lib/actions/members/reorder-members";
import { FacilityInvitation } from "@/types/facility-invitation";
import { Member } from "@/types/member";

type Props = {
  members: Member[];
  invitation: FacilityInvitation | null;
};

export function MembersTable({ members, invitation }: Props) {
  const [searchText, setSearchText] = useState("");
  const [orderedMembers, setOrderedMembers] = useState(members);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setOrderedMembers(members);
  }, [members]);

  const filteredMembers = orderedMembers.filter((member) => {
    return member.name.includes(searchText);
  });

  const sortingDisabled = searchText.length > 0 || isSaving;

  async function saveMemberOrder(
    previousMembers: Member[],
    nextMembers: Member[],
  ) {
    try {
      const result = await reorderMembers(
        nextMembers.map((member) => member.id),
      );

      if (!result.success) {
        setOrderedMembers(previousMembers);
      }
    } catch {
      setOrderedMembers(previousMembers);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="gap-0 px-3 max-sm:px-2 pt-5 pb-0 shadow-none">
      <CardHeader className="border-b px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">所属メンバー</CardTitle>

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

            const previousMembers = orderedMembers;
            const nextMembers = [...orderedMembers];

            const [movedMember] = nextMembers.splice(initialIndex, 1);

            if (!movedMember) return;

            nextMembers.splice(index, 0, movedMember);

            setOrderedMembers(nextMembers);
            setIsSaving(true);

            saveMemberOrder(previousMembers, nextMembers);
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

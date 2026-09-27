import {
  CircleHelp,
  GripHorizontal,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function MembersSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="py-0 shadow-none">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <Users className="size-5 text-primary" />

              <span className="text-sm font-medium text-muted-foreground">
                メンバー数
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <Skeleton className="h-7 w-8" />

              <span className="text-sm text-muted-foreground">名</span>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0 shadow-none">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-primary" />

              <span className="text-sm font-medium text-muted-foreground">
                管理者
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <Skeleton className="h-7 w-8" />

              <span className="text-sm text-muted-foreground">名</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 px-3 pt-5 pb-0 shadow-none max-sm:px-2">
        <CardHeader className="border-b px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base">所属メンバー</CardTitle>
              <div className="flex  items-center gap-1 text-sm text-muted-foreground ">
                <CircleHelp className="size-3.5" />
                ヘルプ
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <InputGroup className="max-sm:hidden">
                <InputGroupInput placeholder="名前で検索" disabled />

                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
              </InputGroup>

              <Button
                variant="outline"
                size="sm"
                disabled
                className="max-sm:text-xs"
              >
                メンバーを招待
              </Button>
            </div>
          </div>

          <InputGroup className="mt-2 sm:hidden">
            <InputGroupInput placeholder="名前で検索" disabled />

            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 px-0" />
                <TableHead className="w-[15%] px-0 text-center">名前</TableHead>

                <TableHead className="w-[15%] px-0 text-center">権限</TableHead>

                <TableHead className="px-0 text-center">個別ルール</TableHead>

                <TableHead className="w-[10%] px-0" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="w-10 px-0">
                    <div className="flex items-center justify-center">
                      <Button variant="ghost" size="icon-sm" disabled>
                        <GripHorizontal className="size-4 max-sm:size-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="px-0">
                    <div className="flex items-center gap-2 max-sm:justify-center">
                      <Skeleton className="size-7 rounded-full max-sm:hidden" />

                      <Skeleton className="h-4 w-20 max-sm:w-16" />
                    </div>
                  </TableCell>

                  <TableCell className="px-2">
                    <div className="flex items-center justify-center">
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                  </TableCell>

                  <TableCell className="px-0">
                    <div className="flex items-center justify-center">
                      <Skeleton className="h-4 w-40 max-sm:w-24" />
                    </div>
                  </TableCell>

                  <TableCell className="px-0">
                    <div className="flex items-center justify-center">
                      <Button variant="ghost" size="icon-sm" disabled>
                        <MoreHorizontal className="size-4 max-sm:size-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

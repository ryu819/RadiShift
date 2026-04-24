"use client";
import { Info } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFacilityForm } from "@/lib/actions/create-facility";
import { joinFacilityForm } from "@/lib/actions/join-facility";

export function FacilityEntryPage() {
  const [createState, createAction, createPending] = useActionState(
    createFacilityForm,
    {
      errors: {},
      values: {},
    },
  );

  const [joinState, joinAction, joinPending] = useActionState(
    joinFacilityForm,
    {
      error: "",
      value: "",
    },
  );
  return (
    <Card className="w-full max-w-sm">
      <Tabs defaultValue="join" className="space-y-3">
        <CardHeader>
          <CardTitle className="text-lg text-center">施設登録</CardTitle>
          <CardDescription className="mb-1">
            施設に参加するか、新しい施設を作成してください
          </CardDescription>
          <TabsList className="w-full">
            <TabsTrigger value="join">施設に参加</TabsTrigger>
            <TabsTrigger value="create">施設を作成</TabsTrigger>
          </TabsList>
        </CardHeader>
        <TabsContent value="join">
          <form action={joinAction} className="space-y-6">
            <CardContent className="space-y-6">
              <Alert className="bg-muted/30">
                <Info className="h-4 w-4" />
                <AlertTitle>招待コードで参加</AlertTitle>
                <AlertDescription className="mt-1">
                  既存施設にメンバーとして参加します
                </AlertDescription>
              </Alert>
              <div className="grid gap-2">
                <Label htmlFor="inviteCode">招待コード</Label>
                <Input
                  id="inviteCode"
                  name="inviteCode"
                  placeholder="10文字の英数字（例: ABc123XyZ0）"
                  required
                />
                {joinState.error && (
                  <p className="text-red-500 text-sm">{joinState.error}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={joinPending} className="w-full">
                {joinPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "施設に参加"
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
        <TabsContent value="create">
          <form action={createAction} className="space-y-6">
            <CardContent className="space-y-6">
              <Alert className="bg-muted/30">
                <Info className="h-4 w-4" />
                <AlertTitle>管理者として登録</AlertTitle>
                <AlertDescription className="mt-1">
                  新しい施設を作成し、管理者権限を取得します
                </AlertDescription>
              </Alert>
              <div className="grid gap-2">
                <Label htmlFor="name">施設名</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="放射線病院"
                  required
                />
                {createState.errors.name && (
                  <p className="text-red-500 text-sm">
                    {createState.errors.name}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={createPending} className="w-full">
                {createPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "施設を作成"
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

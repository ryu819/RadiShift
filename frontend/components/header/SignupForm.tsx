"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>新規登録</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form>
          <DialogHeader className="gap-3 mb-2">
            <DialogTitle className="text-xl">新規登録</DialogTitle>
            <DialogDescription className="mb-2">
              利用規約およびプライバシーポリシーに同意した上で、以下の「登録」ボタンを押してください。
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-2">
            <Field className="gap-2">
              <Label htmlFor="name">ユーザー名</Label>
              <Input id="name" name="name" placeholder="放射 太郎" />
            </Field>
            <Field className="gap-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="radishift@example.com"
              />
            </Field>
            <Field className="gap-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="6文字以上半角英数字のみ"
              />
            </Field>
            <Field className="gap-2">
              <Label htmlFor="passwordConfirmation">パスワード (確認用)</Label>
              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                placeholder="パスワード再入力"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" className="mt-5 text-md w-full">
              登録
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

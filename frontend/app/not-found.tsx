import { AlertCircle, House } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-5">
      <AlertCircle className="w-10 h-10 text-secondary" />
      <h2 className="text-xl text-primary font-semibold">
        指定されたページが見つかりませんでした
      </h2>
      <p className="text-md text-secondary">
        URLが間違っているか、ページが削除された可能性があります。
      </p>
      <Link href="/">
        <Button className="gap-1">
          <House />
          ホームに戻る
        </Button>
      </Link>
    </div>
  );
}

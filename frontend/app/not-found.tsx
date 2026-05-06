import { AlertCircle, House } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ページが見つかりません",
};

export default function NotFound() {
  return (
    <>
      <main className="flex-1 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-5">
          <AlertCircle className="w-10 h-10" />
          <h2 className="text-xl text-primary font-semibold">
            指定されたページが見つかりませんでした
          </h2>
          <p className="text-md">
            URLが間違っているか、ページが削除された可能性があります。
          </p>
          <Link href="/">
            <Button className="gap-1">
              <House />
              ホームに戻る
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

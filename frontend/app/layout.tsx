import "./globals.css";

import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Suspense } from "react";

import { Header } from "@/components/header/Header";
import { FlashToastServer } from "@/components/toast/FlashToastServer";
import { Toaster } from "@/components/ui/sonner";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RadiShift | 放射線技師のシフト管理サービス",
    template: "%s | RadiShift",
  },
  description:
    "放射線技師向けのシフト管理サービスです。休み申請、シフト作成、調整をオンラインで管理し、業務効率化を実現します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} antialiased font-sans bg-slate-50 min-h-screen flex flex-col text-secondary`}
      >
        <Toaster closeButton />
        <Suspense fallback={null}>
          <FlashToastServer />
        </Suspense>

        <Header />

        {children}
      </body>
    </html>
  );
}

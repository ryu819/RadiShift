"use client";

import "./globals.css";

import { ErrorFallback } from "@/components/error/ErrorFallback";

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="ja">
      <head>
        <title>エラー | RadiShift</title>
      </head>
      <body className="antialiased font-sans bg-slate-50 min-h-dvh flex flex-col text-secondary">
        <ErrorFallback error={error} retry={retry} />
      </body>
    </html>
  );
}

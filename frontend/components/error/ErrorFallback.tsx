"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

import { Footer } from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ErrorFallback({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <main className="flex-1 flex items-center justify-center pt-16">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center ">
              <AlertCircle className="h-5 w-5" />
            </div>

            <CardTitle>予期しないエラーが発生しました</CardTitle>

            <CardDescription>時間をおいて再度お試しください。</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {process.env.NODE_ENV === "development" &&
              error instanceof Error && (
                <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                  <p>{error.message}</p>
                </div>
              )}
            <Button type="button" className="w-full" onClick={retry}>
              再試行
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}

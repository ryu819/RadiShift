"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { startDemo } from "@/lib/actions/auth/start-demo";
import { cn } from "@/lib/utils";

export function DemoStartButton({ className }: { className?: string }) {
  const [_serverState, formAction, isPending] = useActionState(startDemo, {});

  return (
    <form action={formAction}>
      <Button
        type="submit"
        variant="secondary"
        className={cn("relative", className)}
        disabled={isPending}
      >
        <span className={cn(isPending && "invisible")}>デモを試す</span>

        {isPending && (
          <span className="absolute">
            <Loader2 className="animate-spin" />
          </span>
        )}
      </Button>
    </form>
  );
}

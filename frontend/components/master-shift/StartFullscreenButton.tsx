"use client";

import { Expand } from "lucide-react";

import { Button } from "@/components/ui/button";

export function StartFullscreenButton() {
  const startMasterShiftFullscreen = () => {
    document.documentElement.classList.add("master-shift-fullscreen");
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={startMasterShiftFullscreen}
    >
      <Expand aria-hidden="true" />
      <span className="max-sm:hidden">全画面</span>
    </Button>
  );
}

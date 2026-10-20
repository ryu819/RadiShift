"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export function ExitFullscreenButton() {
  const exitFullscreen = () => {
    document.documentElement.classList.remove("master-shift-fullscreen");
  };

  useEffect(() => {
    exitFullscreen();
    window.addEventListener("pagehide", exitFullscreen);
    return () => {
      window.removeEventListener("pagehide", exitFullscreen);
      exitFullscreen();
    };
  }, []);
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="master-shift-fullscreen-exit master-shift-print-hide hidden"
      onClick={exitFullscreen}
    >
      <X />
    </Button>
  );
}

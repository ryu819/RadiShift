"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const TOAST_POSITION = "top-center";
const TOAST_DURATION = 6000;

const TOAST_COLORS = {
  pending: "oklch(0.55 0.14 258)", // 青
  failure: "oklch(0.55 0.14 25)", // 赤
  success: "oklch(0.55 0.14 140)", // 緑
};
const TOAST_FONT_SIZE = "15px";

type Toast = {
  type: string;
  message?: string;
};

export function FlashToaster({ flash }: { flash?: string }) {
  useEffect(() => {
    if (!flash) return;

    const data: Toast = JSON.parse(flash);

    if (!data.message) return;

    if (data.type === "pending") {
      toast.dismiss();
      toast.info(data.message, {
        position: TOAST_POSITION,
        duration: TOAST_DURATION,
        style: { color: TOAST_COLORS.pending, fontSize: TOAST_FONT_SIZE },
      });
    } else if (data.type === "failure") {
      toast.dismiss();
      toast.error(data.message, {
        position: TOAST_POSITION,
        duration: TOAST_DURATION,
        style: { color: TOAST_COLORS.failure, fontSize: TOAST_FONT_SIZE },
      });
    } else if (data.type === "success") {
      toast.dismiss();
      toast.success(data.message, {
        position: TOAST_POSITION,
        duration: TOAST_DURATION,
        style: { color: TOAST_COLORS.success, fontSize: TOAST_FONT_SIZE },
      });
    }
  }, [flash]);

  return null;
}

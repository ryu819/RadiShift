"use client";

import { useEffect } from "react";
import { toast } from "sonner";

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
        position: "top-center",
        duration: 6000,
        style: { color: "#3B4DA1", fontSize: "15px" },
      });
    } else if (data.type === "failure") {
      toast.dismiss();
      toast.error(data.message, {
        position: "top-center",
        duration: 6000,
        style: { color: "#c23d3d", fontSize: "15px" },
      });
    } else if (data.type === "success") {
      toast.dismiss();
      toast.success(data.message, {
        position: "top-center",
        duration: 6000,
        style: { color: "#3ca23c", fontSize: "15px" },
      });
    }
  }, [flash]);

  return null;
}

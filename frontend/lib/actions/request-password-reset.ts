"use server";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/actions/get-current-user";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

type RequestPasswordResetResponse = {
  message: string;
  errors?: {
    email?: string;
  };
};

export async function requestPasswordReset() {
  try {
    const userData = await getCurrentUser();
    const res = await fetch(`${process.env.RAILS_API_URL}/password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          email: userData?.email,
        },
      }),
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return;
    }

    const data: RequestPasswordResetResponse = await res.json();

    if (isClientError(res.status)) {
      await setFlashToast({
        type: "failure",
        message: data.message,
      });

      return;
    }

    await setFlashToast({ type: "pending", message: data.message });
  } catch {
    await setFlashToast({ type: "failure" });
    return;
  }

  redirect("/settings");
}

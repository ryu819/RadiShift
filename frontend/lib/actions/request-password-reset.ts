"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/lib/actions/get-current-user";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

type ActionState = {
  errors?: {
    email?: string[];
  };
  values: {
    email?: string;
  };
};

type RequestPasswordResetResponse = {
  message: string;
  errors?: {
    email?: string[];
  };
};

export async function requestPasswordReset(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userData = await getCurrentUser();
  const email = (formData.get("email") as string) ?? userData?.email;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          email,
        },
      }),
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return { values: { email } };
    }

    const data: RequestPasswordResetResponse = await res.json();

    if (isClientError(res.status)) {
      return {
        errors: data.errors,
        values: { email },
      };
    }

    await setFlashToast({ type: "pending", message: data.message });
  } catch {
    await setFlashToast({ type: "failure" });
    return { values: { email } };
  }

  redirect(`${ROUTES.settings}`);
}

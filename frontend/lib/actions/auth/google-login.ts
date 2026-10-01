"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { setJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

type GoogleLoginResponse = {
  message?: string;
};

export type ActionState = {
  message?: string;
};

export async function submitGoogleLogin(
  _prevState: ActionState,
  credential: string,
): Promise<ActionState> {
  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/google_login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credential,
      }),
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return {};
    }

    const data: GoogleLoginResponse = await res.json();

    if (isClientError(res.status)) {
      return {
        message: data.message,
      };
    }

    await setJwt(res.headers.get("authorization"));

    await setFlashToast({
      type: "success",
      message: data.message,
    });
  } catch {
    await setFlashToast({
      type: "failure",
    });

    return {};
  }

  redirect(ROUTES.masterShift);
}

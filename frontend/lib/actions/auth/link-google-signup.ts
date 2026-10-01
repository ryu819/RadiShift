"use server";

import camelcaseKeys from "camelcase-keys";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { ROUTES } from "@/constants/routes";
import { setJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

type GoogleLinkResponse = {
  message?: string;
};

export type ActionState = {
  message?: string;
};

export async function linkGoogleSignup(
  credential: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const currentPassword = formData.get("currentPassword") as string;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/google_signup/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        snakecaseKeys({
          credential,
          currentPassword,
        }),
      ),
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return {};
    }

    const data: GoogleLinkResponse = camelcaseKeys(await res.json(), {
      deep: true,
    });

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

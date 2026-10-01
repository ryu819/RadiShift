"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

type GoogleAccountResponse = {
  message?: string;
};

export type ActionState = {
  success: boolean;
  message?: string;
};

export async function linkGoogleAccount(
  credential: string,
  currentPassword: string,
  _prevState: ActionState,
): Promise<ActionState> {
  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/current/google_account`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt,
        },
        body: JSON.stringify(
          snakecaseKeys({
            credential,
            currentPassword,
          }),
        ),
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return {
        success: false,
      };
    }

    const data: GoogleAccountResponse = await res.json();

    if (isClientError(res.status)) {
      return {
        success: false,
        message: data.message,
      };
    }

    await setFlashToast({
      type: "success",
      message: data.message,
    });

    refresh();

    return {
      success: true,
    };
  } catch {
    await setFlashToast({
      type: "failure",
    });

    return {
      success: false,
    };
  }
}

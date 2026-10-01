"use server";

import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

type GoogleSignupResponse = {
  status?: "new_user" | "existing_user" | "already_registered";
  email?: string;
  name?: string;
  message?: string;
};

export type ActionState = {
  success: boolean;
  status?: "new_user" | "existing_user";
  email?: string;
  name?: string;
  message?: string;
};

export async function checkGoogleSignup(
  _prevState: ActionState,
  credential: string,
): Promise<ActionState> {
  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/google_signup/check`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential,
        }),
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

    const data: GoogleSignupResponse = await res.json();

    if (isClientError(res.status)) {
      return {
        success: false,
        message: data.message,
      };
    }

    if (data.status === "already_registered") {
      return {
        success: false,
        message: data.message,
      };
    }

    return {
      success: true,
      status: data.status,
      email: data.email,
      name: data.name,
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

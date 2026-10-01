"use server";

import { redirect } from "next/navigation";

import { setJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

type GoogleSignupResponse = {
  message?: string;
  errors?: {
    name?: string[];
  };
};

export type GoogleSignupActionState = {
  message?: string;
  errors?: {
    name?: string[];
  };
};

export async function submitGoogleSignup(
  credential: string,
  _prevState: GoogleSignupActionState,
  formData: FormData,
): Promise<GoogleSignupActionState> {
  const name = formData.get("name") as string;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/google_signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credential,
        name,
      }),
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return {};
    }

    const data: GoogleSignupResponse = await res.json();

    if (isClientError(res.status)) {
      return {
        message: data.message,
        errors: data.errors,
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

  redirect("/");
}

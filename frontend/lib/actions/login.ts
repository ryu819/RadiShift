"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import { RailsResponse } from "@/types/rails-response";

type ActionState = {
  values: {
    email?: string;
  };
};

export async function submitLoginForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: { email, password },
      }),
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return { values: { email } };
    }

    const data: RailsResponse = await res.json();

    if (isClientError(res.status)) {
      await setFlashToast({
        type: "failure",
        message: data.error,
      });

      return { values: { email } };
    }

    const jwt = res.headers.get("authorization") as string;

    const cookieStore = await cookies();

    cookieStore.set("jwt", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    await setFlashToast({ type: "success", message: data.message });
  } catch {
    await setFlashToast({
      type: "failure",
    });
    return { values: { email } };
  }

  redirect("/");
}

"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { setFlashToast } from "@/lib/setFlashToast";
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

  const res = await fetch(`${process.env.RAILS_API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: { email, password },
    }),
  });

  const data: RailsResponse = await res.json();

  if (!res.ok) {
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

  redirect("/");
}

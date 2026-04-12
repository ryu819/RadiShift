"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

  const cookieStore = await cookies();

  const data: RailsResponse = await res.json();

  if (!res.ok) {
    cookieStore.set(
      "flashToast",
      JSON.stringify({
        type: "failure",
        message: data.error,
      }),
      {
        path: "/",
        maxAge: 3,
      },
    );

    redirect("/");
  }

  const jwt = res.headers.get("authorization");

  if (!jwt) {
    cookieStore.set(
      "flashToast",
      JSON.stringify({
        type: "failure",
        message: "エラーが発生しました。もう一度お試しください。",
      }),
      { path: "/", maxAge: 3 },
    );

    redirect("/");
  }

  cookieStore.set("jwt", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  cookieStore.set(
    "flashToast",
    JSON.stringify({
      type: "success",
      message: data.message,
    }),
    {
      path: "/",
      maxAge: 3,
    },
  );

  redirect("/");
}

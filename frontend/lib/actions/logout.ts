"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { deleteJwt, getJwt } from "@/lib/actions/jwt";
import { RailsResponse } from "@/types/rails-response";

export async function logout() {
  const cookieStore = await cookies();
  const jwt = await getJwt();

  if (!jwt) redirect("/");

  const res = await fetch(`${process.env.RAILS_API_URL}/logout`, {
    method: "DELETE",
    headers: {
      Authorization: jwt,
    },
  });

  if (res.status >= 500) {
    cookieStore.set(
      "flashToast",
      JSON.stringify({
        type: "failure",
        message:
          "現在サーバーで問題が発生しています。しばらくしてからもう一度お試しください。",
      }),
      {
        path: "/",
        maxAge: 3,
      },
    );

    return;
  }

  const data: RailsResponse = await res.json();

  if (!res.ok) {
    cookieStore.set(
      "flashToast",
      JSON.stringify({
        type: "failure",
        message: data.message,
      }),
      {
        path: "/",
        maxAge: 3,
      },
    );
    return;
  }

  await deleteJwt();

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

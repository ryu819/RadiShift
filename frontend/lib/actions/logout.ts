"use server";
import { redirect } from "next/navigation";

import { deleteJwt, getJwt } from "@/lib/actions/jwt";
import { setFlashToast } from "@/lib/setFlashToast";
import { RailsResponse } from "@/types/rails-response";

export async function logout() {
  const jwt = await getJwt();

  if (!jwt) redirect("/");

  const res = await fetch(`${process.env.RAILS_API_URL}/logout`, {
    method: "DELETE",
    headers: {
      Authorization: jwt,
    },
  });

  if (res.status >= 500) {
    await setFlashToast({
      type: "failure",
    });

    return;
  }

  const data: RailsResponse = await res.json();

  if (res.status >= 400) {
    await setFlashToast({
      type: "failure",
      message: data.message,
    });

    return;
  }

  await deleteJwt();

  await setFlashToast({ type: "success", message: data.message });

  redirect("/");
}

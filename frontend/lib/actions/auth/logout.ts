"use server";
import { redirect } from "next/navigation";

import { deleteJwt, getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import { RailsResponse } from "@/types/rails-response";

export async function logout() {
  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/logout`, {
      method: "DELETE",
      headers: {
        Authorization: jwt,
      },
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return;
    }

    const data: RailsResponse = await res.json();

    if (isClientError(res.status)) {
      await setFlashToast({
        type: "failure",
        message: data.message,
      });

      return;
    }

    await deleteJwt();

    await setFlashToast({ type: "success", message: data.message });
  } catch {
    await setFlashToast({ type: "failure" });
    return;
  }

  redirect("/");
}

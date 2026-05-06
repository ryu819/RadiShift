"use server";

import { redirect } from "next/navigation";

import { deleteJwt, getJwt } from "@/lib/actions/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import { RailsResponse } from "@/types/rails-response";

type ActionState = {
  error?: string;
};

export async function deleteUser(
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const jwt = await getJwt();
  if (!jwt) redirect("/");

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/current/user`, {
      method: "DELETE",
      headers: {
        Authorization: jwt,
      },
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return {};
    }

    const data: RailsResponse = await res.json();

    if (isClientError(res.status)) {
      return {
        error: data.error,
      };
    }

    await deleteJwt();

    await setFlashToast({ type: "success", message: data.message });

    return {};
  } catch {
    await setFlashToast({ type: "failure" });
    return {};
  }
}

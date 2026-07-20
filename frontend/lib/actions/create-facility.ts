"use server";
import { redirect } from "next/navigation";

import { getJwt } from "@/lib/actions/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

type ActionState = {
  errors: {
    name?: string[];
  };
  values: {
    name?: string;
  };
};

type CreateFacilityResponse = {
  message: string;
  errors: {
    name?: string[];
  };
};

export async function createFacilityForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = formData.get("name") as string;
  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/facility`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
      body: JSON.stringify({
        facility: {
          name,
        },
      }),
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return {
        errors: {},
        values: { name },
      };
    }

    const data: CreateFacilityResponse = await res.json();

    if (isClientError(res.status)) {
      await setFlashToast({
        type: "failure",
        message: data.message,
      });

      return {
        errors: data.errors,
        values: { name },
      };
    }

    await setFlashToast({ type: "success", message: data.message });
  } catch {
    await setFlashToast({ type: "failure" });
    return {
      errors: {},
      values: { name },
    };
  }

  redirect("/admin-dashboard");
}

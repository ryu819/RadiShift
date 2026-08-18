"use server";

import camelcaseKeys from "camelcase-keys";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { getJwt } from "@/lib/actions/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

export type ActionState = {
  success: boolean;
  errors?: {
    name?: string[];
    colorCode?: string[];
  };
};

type CreateModalityTypeResponse = {
  message?: string;
  errors?: {
    name?: string[];
    colorCode?: string[];
  };
};

export async function createModalityTypeForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = formData.get("name") as string;
  const colorCode = formData.get("colorCode") as string;

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(`${process.env.RAILS_API_URL}/modality_types`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
      body: JSON.stringify(
        snakecaseKeys({
          modalityType: {
            name,
            colorCode,
          },
        }),
      ),
    });

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    const data: CreateModalityTypeResponse = camelcaseKeys(await res.json(), {
      deep: true,
    });

    if (isClientError(res.status)) {
      return {
        success: false,
        errors: data.errors,
      };
    }

    return { success: true };
  } catch {
    await setFlashToast({ type: "failure" });

    return { success: false };
  }
}

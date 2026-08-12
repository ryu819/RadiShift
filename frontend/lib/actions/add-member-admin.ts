"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getJwt } from "@/lib/actions/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import { RailsResponse } from "@/types/rails-response";

export type ActionState = {
  success?: boolean;
  error?: string;
};

export async function addMemberAdminForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const memberId = Number(formData.get("memberId"));

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/members/${memberId}/add_admin`,
      {
        method: "PATCH",
        headers: {
          Authorization: jwt,
        },
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return {};
    }

    const data: RailsResponse = await res.json();

    if (isClientError(res.status)) {
      return {
        error: data.message ?? "管理者権限の付与に失敗しました。",
      };
    }

    revalidatePath("/admin-dashboard");

    return {
      success: true,
    };
  } catch {
    await setFlashToast({ type: "failure" });

    return {};
  }
}

"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import { RailsResponse } from "@/types/rails-response";

type ActionState = {
  success: boolean;
  error?: string;
};

export async function removeMemberAdminForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const memberId = Number(formData.get("memberId"));

  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/members/${memberId}/remove_admin`,
      {
        method: "PATCH",
        headers: {
          Authorization: jwt,
        },
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { success: false };
    }

    const data: RailsResponse = await res.json();

    if (isClientError(res.status)) {
      return {
        success: false,
        error: data.message ?? "管理者権限の解除に失敗しました。",
      };
    }

    updateTag(CACHE_TAGS.members);

    return {
      success: true,
    };
  } catch {
    await setFlashToast({ type: "failure" });

    return { success: false };
  }
}

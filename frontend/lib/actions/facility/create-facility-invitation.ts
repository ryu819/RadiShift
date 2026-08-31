"use server";

import camelcaseKeys from "camelcase-keys";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import { FacilityInvitation } from "@/types/facility-invitation";

type ActionState = {
  invitation?: FacilityInvitation | null;
  error?: string;
};

type CreateFacilityInvitationResponse = FacilityInvitation & {
  message: string;
};

export async function createFacilityInvitationForm(
  prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const jwt = await getJwt();

  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/facility/invitation`,
      {
        method: "POST",
        headers: {
          Authorization: jwt,
        },
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { ...prevState };
    }

    if (isClientError(res.status)) {
      await setFlashToast({ type: "failure" });

      return { ...prevState };
    }

    const data: CreateFacilityInvitationResponse = camelcaseKeys(
      await res.json(),
      { deep: true },
    );

    updateTag(CACHE_TAGS.facilityInvitation);

    return {
      invitation: {
        inviteCode: data.inviteCode,
        inviteExpiresAt: data.inviteExpiresAt,
      },
      error: "",
    };
  } catch {
    await setFlashToast({ type: "failure" });
    return {
      ...prevState,
    };
  }
}

"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import { RailsResponse } from "@/types/rails-response";

type UploadTargetResponse = {
  upload_url: string;
  headers: Record<string, string>;
  signed_id: string;
};

export async function prepareAvatarImageUpload(image: {
  contentType: string;
  byteSize: number;
  checksum: string;
}) {
  const jwt = await getJwt();
  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/current/user/avatar_image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt,
        },
        body: JSON.stringify({
          content_type: image.contentType,
          byte_size: image.byteSize,
          checksum: image.checksum,
        }),
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });
      return null;
    }

    if (isClientError(res.status)) {
      const data: RailsResponse = await res.json();
      await setFlashToast({ type: "failure", message: data.message });
      return null;
    }

    const data: UploadTargetResponse = await res.json();

    return {
      uploadUrl: data.upload_url,
      headers: data.headers,
      signedId: data.signed_id,
    };
  } catch {
    await setFlashToast({ type: "failure" });
    return null;
  }
}

export async function updateAvatarImage(signedId: string) {
  const jwt = await getJwt();
  if (!jwt) redirect("/");

  try {
    const res = await fetch(
      `${process.env.RAILS_API_URL}/current/user/avatar_image`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt,
        },
        body: JSON.stringify(snakecaseKeys({ signedId })),
      },
    );

    if (isServerError(res.status)) {
      await setFlashToast({ type: "failure" });
      return;
    }

    const data: RailsResponse = await res.json();

    if (isClientError(res.status)) {
      await setFlashToast({ type: "failure", message: data.message });
      return;
    }

    await setFlashToast({ type: "success", message: data.message });

    updateTag(CACHE_TAGS.members);
  } catch {
    await setFlashToast({ type: "failure" });
  }
}

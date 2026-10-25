"use client";

import { Camera, Loader2 } from "lucide-react";
import { ChangeEvent, useTransition } from "react";

import { showFlashToast } from "@/components/toast/FlashToaster";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  prepareAvatarImageUpload,
  updateAvatarImage,
} from "@/lib/actions/account/upload-image";
import {
  calculateChecksum,
  isValidAvatarImage,
  resizeAvatarImage,
} from "@/lib/avatar-image";
import { User } from "@/types/user";

const ERROR_MESSAGES = {
  INVALID_IMAGE: "5MiB未満のJPEG・PNG画像を選び直してください。",
  RESIZE_FAILED: "画像を加工できませんでした。別の画像を選び直してください。",
  UPLOAD_FAILED:
    "画像を送信できませんでした。しばらくしてからもう一度お試しください。",
};

const UPLOAD_TIMEOUT_MS = 60 * 1000;

export function UploadImageForm({ user }: { user: User | null }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;

    if (!isValidAvatarImage(file)) {
      showFlashToast({
        type: "failure",
        message: ERROR_MESSAGES.INVALID_IMAGE,
      });
      return;
    }

    startTransition(async () => {
      let image: Blob;
      let checksum: string;
      try {
        image = await resizeAvatarImage(file);
        checksum = await calculateChecksum(image);
      } catch {
        showFlashToast({
          type: "failure",
          message: ERROR_MESSAGES.RESIZE_FAILED,
        });
        return;
      }

      const target = await prepareAvatarImageUpload({
        contentType: image.type,
        byteSize: image.size,
        checksum,
      });
      if (!target) return;

      try {
        const res = await fetch(target.uploadUrl, {
          method: "PUT",
          headers: target.headers,
          body: image,
          signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
        });
        if (!res.ok) throw new Error();
      } catch {
        showFlashToast({
          type: "failure",
          message: ERROR_MESSAGES.UPLOAD_FAILED,
        });
        return;
      }

      await updateAvatarImage(target.signedId);
    });
  }

  return (
    <Label
      htmlFor="avatarImage"
      className="relative w-fit mx-auto block cursor-pointer"
    >
      <Avatar className="w-24 h-24">
        <AvatarImage
          src={user?.avatarImageUrl ?? "/images/default-user-icon.png"}
        />
        <AvatarFallback />
      </Avatar>

      <Button
        type="button"
        size="icon-sm"
        className="absolute bottom-0 right-0 rounded-full pointer-events-none"
      >
        {isPending ? <Loader2 className="animate-spin" /> : <Camera />}
      </Button>

      <Input
        id="avatarImage"
        name="avatarImage"
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        disabled={isPending}
        onChange={handleChange}
      />
    </Label>
  );
}

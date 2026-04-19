"use client";

import { Camera } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImage } from "@/lib/actions/upload-image";
import { User } from "@/types/user";

export function UploadImageForm({ user }: { user: User | null }) {
  return (
    <form action={uploadImage}>
      <Label
        htmlFor="avatarImage"
        className="relative w-fit mx-auto block cursor-pointer"
      >
        <Avatar className="w-24 h-24">
          <AvatarImage
            src={user?.avatarImageUrl ?? "/images/default-user-icon.png"}
          />
          <AvatarFallback>{user?.name}</AvatarFallback>
        </Avatar>

        <Button
          type="button"
          size="icon-sm"
          className="absolute bottom-0 right-0 rounded-full pointer-events-none"
        >
          <Camera />
        </Button>

        <Input
          id="avatarImage"
          name="avatarImage"
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        />
      </Label>
    </form>
  );
}

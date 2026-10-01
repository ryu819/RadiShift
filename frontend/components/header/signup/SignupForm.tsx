"use client";

import { useState } from "react";

import { SignupContent } from "@/components/header/signup/SignupContent";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function SignUpForm() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>新規登録</Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-xs sm:max-w-sm"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <SignupContent
          onClose={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

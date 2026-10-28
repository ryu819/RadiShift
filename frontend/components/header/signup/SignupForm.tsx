"use client";

import { useState } from "react";

import { ResendConfirmationDialog } from "@/components/header/ResendConfirmationDialog";
import { SignupContent } from "@/components/header/signup/SignupContent";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function SignUpForm({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [resendConfirmationOpen, setResendConfirmationOpen] = useState(false);

  const openResendConfirmationDialog = () => {
    setOpen(false);
    setResendConfirmationOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className={triggerClassName}>新規登録</Button>
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
            onOpenResendConfirmation={openResendConfirmationDialog}
          />
        </DialogContent>
      </Dialog>

      <ResendConfirmationDialog
        open={resendConfirmationOpen}
        onOpenChange={setResendConfirmationOpen}
      />
    </>
  );
}

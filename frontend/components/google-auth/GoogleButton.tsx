"use client";

import { useEffect, useRef } from "react";

import { useGoogleIdentity } from "@/components/google-auth/GoogleIdentityProvider";
import type { GoogleButtonText } from "@/types/google-identity";

type Props = {
  text: GoogleButtonText;
  onCredential: (credential: string) => void;
};

export function GoogleButton({ text, onCredential }: Props) {
  const buttonRef = useRef<HTMLDivElement>(null);

  const { ready, setCredentialHandler } = useGoogleIdentity();

  useEffect(() => {
    setCredentialHandler(onCredential);

    return () => {
      setCredentialHandler(null);
    };
  }, [onCredential, setCredentialHandler]);

  useEffect(() => {
    if (!ready || !buttonRef.current || !window.google) return;

    const width = Math.min(buttonRef.current.offsetWidth, 400);

    buttonRef.current.replaceChildren();

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text,
      shape: "rectangular",
      logo_alignment: "center",
      locale: "ja",
      width: String(width),
    });
  }, [ready, text]);

  return <div ref={buttonRef} className="w-full" />;
}

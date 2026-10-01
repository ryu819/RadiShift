"use client";

import Script from "next/script";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type CredentialHandler = (credential: string) => void;

type GoogleIdentityContextValue = {
  ready: boolean;
  setCredentialHandler: (handler: CredentialHandler | null) => void;
};

const GoogleIdentityContext = createContext<GoogleIdentityContextValue | null>(
  null,
);

type Props = {
  children: React.ReactNode;
  clientId?: string;
};

export function GoogleIdentityProvider({ children, clientId }: Props) {
  const [ready, setReady] = useState(false);

  const initializedRef = useRef(false);

  const credentialHandlerRef = useRef<CredentialHandler | null>(null);

  const setCredentialHandler = useCallback(
    (handler: CredentialHandler | null) => {
      credentialHandlerRef.current = handler;
    },
    [],
  );

  const initializeGoogleIdentity = useCallback(() => {
    if (initializedRef.current) return;
    if (!clientId) return;
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      ux_mode: "popup",
      callback: (response) => {
        credentialHandlerRef.current?.(response.credential);
      },
    });

    initializedRef.current = true;
    setReady(true);
  }, [clientId]);

  return (
    <GoogleIdentityContext.Provider
      value={{
        ready,
        setCredentialHandler,
      }}
    >
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={initializeGoogleIdentity}
      />

      {children}
    </GoogleIdentityContext.Provider>
  );
}

export function useGoogleIdentity() {
  const context = useContext(GoogleIdentityContext);

  if (!context) {
    throw new Error(
      "useGoogleIdentity must be used within GoogleIdentityProvider.",
    );
  }

  return context;
}

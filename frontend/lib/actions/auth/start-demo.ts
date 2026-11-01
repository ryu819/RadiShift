"use server";

import { checkRateLimit } from "@vercel/firewall";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { setJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";
import { RailsResponse } from "@/types/rails-response";

type ActionState = {
  error?: string;
};

const DEMO_CLIENT_ID_COOKIE = "demoClientId";
const DEMO_CLIENT_ID_MAX_AGE = 60 * 60 * 24 * 365;
const DEMO_RATE_LIMIT_ID = "demo-start";
const DEMO_RATE_LIMIT_TIMEOUT_MS = 3000;
const DEMO_RATE_LIMITED_MESSAGE =
  "デモの開始回数が上限に達しました。しばらくしてからお試しください。";

async function isDemoStartRateLimited() {
  const cookieStore = await cookies();
  let clientId = cookieStore.get(DEMO_CLIENT_ID_COOKIE)?.value;

  if (!clientId) {
    clientId = crypto.randomUUID();
    cookieStore.set(DEMO_CLIENT_ID_COOKIE, clientId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DEMO_CLIENT_ID_MAX_AGE,
    });
  }

  if (process.env.VERCEL_ENV !== "production") return false;

  try {
    const { rateLimited } = await checkRateLimit(DEMO_RATE_LIMIT_ID, {
      headers: await headers(),
      rateLimitKey: `browser:${clientId}`,
      timeout: DEMO_RATE_LIMIT_TIMEOUT_MS,
    });

    return rateLimited;
  } catch {
    return false;
  }
}

export async function startDemo(
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    if (await isDemoStartRateLimited()) {
      await setFlashToast({
        type: "failure",
        message: DEMO_RATE_LIMITED_MESSAGE,
      });

      return {};
    }

    const res = await fetch(`${process.env.RAILS_API_URL}/demo_session`, {
      method: "POST",
    });

    if (isServerError(res.status)) {
      await setFlashToast({
        type: "failure",
      });

      return {};
    }

    const data: RailsResponse = await res.json();

    if (isClientError(res.status)) {
      await setFlashToast({ type: "failure" });

      return {};
    }

    await setJwt(res.headers.get("authorization"));

    await setFlashToast({
      type: "success",
      message: data.message,
    });
  } catch {
    await setFlashToast({
      type: "failure",
    });

    return {};
  }

  redirect(ROUTES.masterShift);
}

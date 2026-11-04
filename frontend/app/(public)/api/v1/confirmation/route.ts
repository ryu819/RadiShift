import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { setFlashToast } from "@/lib/set-flash-toast";
import { RailsResponse } from "@/types/rails-response";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("confirmation_token");
  try {
    if (!token) {
      await setFlashToast({ type: "failure" });
    } else {
      const railsRes = await fetch(
        `${process.env.RAILS_API_URL}/confirmation?confirmation_token=${encodeURIComponent(token)}`,
      );
      const data: RailsResponse = await railsRes.json();

      await setFlashToast({
        type: railsRes.ok ? "success" : "failure",
        message: data.message,
      });
    }
  } catch {
    await setFlashToast({ type: "failure" });
  }

  redirect("/");
}

import { type NextRequest, NextResponse } from "next/server";

import { RailsResponse } from "@/types/rails-response";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("confirmation_token");
  const res = NextResponse.redirect(
    new URL("/settings", process.env.NEXT_PUBLIC_URL),
  );

  const railsRes = await fetch(
    `${process.env.RAILS_API_URL}/confirmation?confirmation_token=${token}`,
  );

  const data: RailsResponse = await railsRes.json();

  if (!railsRes.ok) {
    res.cookies.set(
      "flashToast",
      JSON.stringify({
        type: "failure",
        message: data.message,
      }),
      {
        path: "/",
        maxAge: 3,
      },
    );
    return res;
  }

  res.cookies.set(
    "flashToast",
    JSON.stringify({
      type: "success",
      message: data.message,
    }),
    {
      path: "/",
      maxAge: 3,
    },
  );

  return res;
}

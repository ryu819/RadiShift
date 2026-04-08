import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Health Check",
};

async function getHealthCheck() {
  type response = {
    message: string;
  };
  const res = await fetch(process.env.RAILS_API_URL + "/health_check");

  if (!res.ok) {
    throw new Error("API connection error");
  }

  const data: response = await res.json();

  return data.message;
}

async function HealthCheck() {
  const message = await getHealthCheck();
  return <div>{message}</div>;
}

export default async function page() {
  return (
    <Suspense fallback="Loading...">
      <HealthCheck />
    </Suspense>
  );
}

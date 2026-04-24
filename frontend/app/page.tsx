import { Suspense } from "react";

import { TopPage } from "@/components/TopPage";

export default async function Home() {
  return (
    <Suspense fallback={null}>
      <TopPage />
    </Suspense>
  );
}

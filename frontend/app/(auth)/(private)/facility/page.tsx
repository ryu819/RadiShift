import { Building2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { FacilityInformation } from "@/components/facility/FacilityInformation";
import { FacilityInformationSkeleton } from "@/components/facility/FacilityInformationSkeleton";
import { RequireFacility } from "@/components/RequireFacility";

export const metadata: Metadata = {
  title: "施設情報",
};

export default function FacilityPage() {
  return (
    <div className="flex flex-1 justify-center p-3 md:p-8">
      <Suspense fallback={null}>
        <RequireFacility />
      </Suspense>
      <div className="w-full space-y-10 sm:space-y-15">
        <div className="flex items-center gap-1 text-xs md:gap-2 md:text-sm h-8">
          <Building2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span>施設情報</span>
        </div>

        <Suspense fallback={<FacilityInformationSkeleton />}>
          <FacilityInformation />
        </Suspense>
      </div>
    </div>
  );
}

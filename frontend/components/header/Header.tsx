import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { HeaderAuthSection } from "@/components/header/HeaderAuthSection";

export function Header() {
  return (
    <header className="bg-white border-b border-border  px-4 fixed w-full h-16 flex justify-between items-center z-50 master-shift-print-hide master-shift-fullscreen-hide">
      <Link href="/" className="flex items-center gap-1">
        <Image src="/icon.png" alt="icon" width={50} height={50} />
        <div className="hidden xs:block text-3xl font-semibold text-primary">
          RadiShift
        </div>
      </Link>

      <nav className="flex items-center gap-3 text-sm">
        <Suspense fallback={null}>
          <HeaderAuthSection />
        </Suspense>
      </nav>
    </header>
  );
}

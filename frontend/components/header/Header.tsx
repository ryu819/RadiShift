import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 px-4 fixed  w-full h-16 flex justify-between items-center ">
      <Link href="/" className="flex items-center gap-1">
        <Image src="/icon.png" alt="icon" width={50} height={50} />
        <div className="hidden xs:block text-3xl font-semibold text-primary">
          RadiShift
        </div>
      </Link>

      <nav className="flex items-center gap-3 text-sm">
        <Button>新規登録</Button>
        <Button>ログイン</Button>
      </nav>
    </header>
  );
}

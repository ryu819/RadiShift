import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROUTES } from "@/constants/routes";

export function MoreNavItem() {
  return (
    <li className="flex flex-1 justify-center">
      <Sheet>
        <SheetTrigger className="flex flex-col items-center justify-center gap-2 hover:opacity-70 transition text-secondary cursor-pointer">
          <MoreHorizontal className="size-5" />
          <span className="text-xs font-semibold leading-none">その他</span>
        </SheetTrigger>
        <SheetContent side="bottom" className="gap-1">
          <SheetHeader>
            <SheetTitle className="text-secondary">その他の項目</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col text-secondary mx-4 mb-2 gap-2 divide-y ">
            <SheetClose asChild>
              <Link
                href={`${ROUTES.terms}`}
                className="hover:opacity-70 transition"
              >
                利用規約
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href={`${ROUTES.privacyPolicy}`}
                className="hover:opacity-70 transition"
              >
                プライバシーポリシー
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href={`${ROUTES.contact}`}
                className="hover:opacity-70 transition"
              >
                お問い合わせ
              </Link>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </li>
  );
}

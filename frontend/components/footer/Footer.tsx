import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border p-4 w-full flex flex-col justify-center items-center text-secondary text-sm gap-3 z-20">
      <div className="space-x-4 ">
        <Link
          href="/terms"
          className="hover:opacity-70 transition max-sm:text-xs"
        >
          利用規約
        </Link>
        <Link
          href="/privacy-policy"
          className="hover:opacity-70 transition max-sm:text-xs"
        >
          プライバシーポリシー
        </Link>
        <Link
          href="/contact"
          className="hover:opacity-70 transition max-sm:text-xs"
        >
          お問い合わせ
        </Link>
      </div>
      <div>
        <p>© 2026 RadiShift</p>
      </div>
    </footer>
  );
}

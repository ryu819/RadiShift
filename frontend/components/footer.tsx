import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 p-4 w-full flex flex-col justify-center items-center text-secondary text-sm gap-3 ">
      <div className="space-x-4">
        <Link href="/terms" className="hover:opacity-50 transition">
          利用規約
        </Link>
        <Link href="/privacy-policy" className="hover:opacity-50 transition">
          プライバシーポリシー
        </Link>
      </div>
      <div>
        <p>© 2026 RadiShift</p>
      </div>
    </footer>
  );
}

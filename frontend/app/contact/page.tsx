import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-base leading-6.5 text-secondary">
      <h1 className="text-2xl font-bold mb-6 text-center">お問い合わせ</h1>
      <p className="mb-2">
        お問い合わせは以下のメールアドレスまでお願いいたします。
      </p>
      <Link
        href="mailto:test@gmail.com"
        className="text-primary  hover:opacity-50 transition"
      >
        test@gmail.com
      </Link>

      <div className="mt-4">
        <p className="font-bold mb-2">お問い合わせ時の記載項目（任意）</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>お名前（任意）</li>
          <li>ご利用環境（例：iPhone / Chrome など）</li>
          <li>お問い合わせ内容</li>
        </ul>
      </div>
    </div>
  );
}

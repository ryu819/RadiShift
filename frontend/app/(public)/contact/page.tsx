import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ",
};

const CONTACT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc9aS_9tsKsewEY1tHiduFOTISCO56Jb-Whg3CA66sV2Gcllg/viewform";

export default function ContactPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 text-base leading-6.5">
      <h1 className="text-2xl font-bold mb-6 text-center">お問い合わせ</h1>
      <p className="mb-2 text-center">
        お問い合わせや不具合のご報告は、以下のフォームからお送りください。
      </p>
      <p className="mb-6 text-center">
        フォームが表示されない場合は、
        <a
          href={CONTACT_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:opacity-50 transition"
        >
          こちら
        </a>
        をクリックしてください。
      </p>

      <iframe
        src={`${CONTACT_FORM_URL}?embedded=true`}
        title="お問い合わせフォーム"
        loading="lazy"
        className="w-full h-[880px] border-0"
      >
        読み込んでいます…
      </iframe>
    </div>
  );
}

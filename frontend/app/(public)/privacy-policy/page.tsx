import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-base leading-6.5">
      <h1 className="text-2xl font-bold mb-6 text-center">
        プライバシーポリシー
      </h1>

      <p className="mb-6">
        本ウェブサイト上で提供するサービス「RadiShift」（以下、「本サービス」といいます。）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">第1条（個人情報）</h2>
      <p>
        「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、特定の個人を識別できる情報（個人識別情報）を指します。
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">
        第2条（個人情報の収集方法）
      </h2>
      <p>
        本サービスは、ユーザーが利用登録をする際に、名前、メールアドレスを取得します。
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">
        第3条（個人情報を収集・利用する目的）
      </h2>
      <p>本サービスが個人情報を収集・利用する目的は、以下のとおりです。</p>
      <ul className="list-decimal pl-5 space-y-1">
        <li>本サービスの提供・運営のため</li>
        <li>
          ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）
        </li>
        <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
        <li>利用規約に違反したユーザーの特定および対応のため</li>
        <li>ユーザーに登録情報の閲覧・変更を行っていただくため</li>
        <li>上記の利用目的に付随する目的</li>
      </ul>

      <h2 className="text-lg font-bold mt-6 mb-2">第4条（利用目的の変更）</h2>
      <ul className="list-decimal pl-5 space-y-1">
        <li>
          本サービスは、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。
        </li>
        <li>
          利用目的の変更を行った場合には、変更後の目的について、本サービス所定の方法により、ユーザーに通知、または本ウェブサイト上に公表するものとします。
        </li>
      </ul>

      <h2 className="text-lg font-bold mt-6 mb-2">
        第5条（アクセス解析ツール）
      </h2>
      <p>
        本サービスは、ユーザーのアクセス解析のために、「Googleアナリティクス」を利用しています。Googleアナリティクスは、トラフィックデータの収集のためにCookieを使用しています。トラフィックデータは匿名で収集されており、個人を特定するものではありません。Cookieを無効にすれば、これらの情報の収集を拒否することができます。詳しくはお使いのブラウザの設定をご確認ください。
        Googleアナリティクスについて、詳しくは
        <Link
          href="https://marketingplatform.google.com/about/analytics/terms/jp/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:opacity-50 transition"
        >
          Google Analytics 利用規約
        </Link>
        からご確認下さい。
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">
        第6条（個人情報の第三者提供）
      </h2>
      <p>
        本サービスは、ユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">
        第7条（個人情報の安全管理）
      </h2>
      <p>
        本サービスは、個人情報の漏洩、滅失またはき損の防止のために、適切なセキュリティ対策を実施し、個人情報の安全管理に努めます。
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">第8条（開示・訂正・削除）</h2>
      <p>
        お客様は、当サービスが保有するご自身の個人情報について、開示・訂正・削除を求めることができます。ご希望の場合は、
        <Link
          href="/contact"
          className="text-primary underline hover:opacity-50 transition"
        >
          お問い合わせ
        </Link>
        までご連絡ください。ご本人確認のうえ、合理的な期間内に対応いたします。
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">
        第9条（プライバシーポリシーの変更）
      </h2>
      <ul className="list-decimal pl-5 space-y-1">
        <li>
          本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。
        </li>
        <li>
          本サービスが別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
        </li>
      </ul>
    </div>
  );
}

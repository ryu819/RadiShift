import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center pt-16">
        {children}
      </main>
      <Footer />
    </>
  );
}

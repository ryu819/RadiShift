import { Footer } from "@/components/footer/Footer";
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-1 flex items-center justify-center pt-16">
        {children}
      </main>
      <Footer />
    </>
  );
}

import { Header } from "@/components/layout/Header";
import { AboutSection } from "@/components/home/AboutSection";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-5rem)] bg-white">
        <AboutSection />
      </main>
    </>
  );
}

import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { PopularBurgers } from "@/components/home/PopularBurgers";
import { FeaturesBar } from "@/components/home/FeaturesSection";
import { HomeInfoSection } from "@/components/home/HomeInfoSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <PopularBurgers />
        <FeaturesBar />
        <HomeInfoSection />
      </main>
    </>
  );
}

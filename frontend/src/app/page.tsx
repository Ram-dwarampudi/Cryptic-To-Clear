import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureHighlights from "@/components/FeatureHighlights";
import AuthSection from "@/components/auth/AuthSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <Hero />
      <FeatureHighlights />
      <AuthSection />
      <Footer />
    </main>
  );
}

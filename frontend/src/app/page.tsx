import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CrypticWorkflowShowcase from "@/components/CrypticWorkflowShowcase";
import FeatureHighlights from "@/components/FeatureHighlights";
import AuthSection from "@/components/auth/AuthSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <Hero />
      <CrypticWorkflowShowcase />
      <FeatureHighlights />
      <AuthSection />
      <Footer />
    </main>
  );
}

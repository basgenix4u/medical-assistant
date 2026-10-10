// src/app/page.tsx — Premium conversion-focused landing (E12)

import { Navbar } from "@/components/marketing/Navbar";
import { HeroSection } from "@/components/marketing/HeroSection";
import { SocialProof } from "@/components/marketing/SocialProof";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { ProductShowcase } from "@/components/marketing/ProductShowcase";
import { BenefitsSection } from "@/components/marketing/BenefitsSection";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { FAQSection } from "@/components/marketing/FAQSection";
import { CTASection } from "@/components/marketing/CTASection";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <HeroSection />
      <SocialProof />
      <FeaturesSection />
      <ProductShowcase />
      <BenefitsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}

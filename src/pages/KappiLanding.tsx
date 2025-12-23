import { KappiHeader } from "@/components/landing/KappiHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBanner } from "@/components/landing/TrustBanner";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { TestimonialSection } from "@/components/landing/TestimonialSection";
import { CTASection } from "@/components/landing/CTASection";
import { KappiFooter } from "@/components/landing/KappiFooter";

const KappiLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      <KappiHeader />
      <main>
        <HeroSection />
        <TrustBanner />
        <FeatureGrid />
        <TestimonialSection />
        <CTASection />
      </main>
      <KappiFooter />
    </div>
  );
};

export default KappiLanding;
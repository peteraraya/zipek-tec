import Hero from "@/components/sections/Hero";
import TechStack from "@/components/sections/TechStack";
import Services from "@/components/sections/Services";
import Features from "@/components/sections/Features";
import Methodology from "@/components/sections/Methodology";
import Portfolio from "@/components/sections/Portfolio";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import ROICalculator from "@/components/sections/ROICalculator";
import DigitalExperienceTeaser from "@/components/sections/DigitalExperienceTeaser";
import FadeIn from "@/components/layout/FadeIn";
import { features } from "@/config/site";

export default function Home() {
  return (
    <>
      <main className="flex-grow pt-20">
        <FadeIn direction="none">
          <Hero />
        </FadeIn>
        
        {features.enableTechStack && (
          <FadeIn delay={0.2}>
            <TechStack />
          </FadeIn>
        )}

        <FadeIn>
          <Services />
        </FadeIn>

        <FadeIn>
          <Features />
        </FadeIn>

        <FadeIn>
          <DigitalExperienceTeaser />
        </FadeIn>

        {features.enableMethodology && (
          <FadeIn>
            <Methodology />
          </FadeIn>
        )}

        {features.enablePortfolio && (
          <FadeIn>
            <Portfolio />
          </FadeIn>
        )}

        {features.enablePricing && (
          <FadeIn>
            <Pricing />
          </FadeIn>
        )}

        {features.enableROICalculator && (
          <FadeIn>
            <ROICalculator />
          </FadeIn>
        )}

        {features.enableTestimonials && (
          <FadeIn>
            <Testimonials />
          </FadeIn>
        )}

        {features.enableFAQ && (
          <FadeIn>
            <FAQ />
          </FadeIn>
        )}

        {features.enableContactWizard && (
          <FadeIn>
            <Contact />
          </FadeIn>
        )}
      </main>
      </>
  );
}

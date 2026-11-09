import { CoffeeBuilder } from "@/features/coffee-builder";
import { useReveal } from "@/shared/lib";
import { HeroShowcase } from "@/widgets/hero-showcase";
import { AboutSection } from "./AboutSection";
import { CtaSection } from "./CtaSection";
import { FeaturesSection } from "./FeaturesSection";
import { PopularSection } from "./PopularSection";
import { QuotesSection } from "./QuotesSection";

/** Лендинг «вечернего эспрессо-бара» (порт mockup/index.html) */
export function HomePage() {
  const builderRef = useReveal<HTMLDivElement>();

  return (
    <>
      <HeroShowcase />

      <PopularSection />
      <FeaturesSection />
      <AboutSection />
      <QuotesSection />
      <CtaSection />

      {/* Конструктор «Собери свой кофе» — самый низ лендинга */}
      <div ref={builderRef}>
        <CoffeeBuilder />
      </div>
    </>
  );
}

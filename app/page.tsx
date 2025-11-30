"use client"

import { MurrumbellaHeader } from "@/components/murrumbella/header"
import { MurrumbellaHero } from "@/components/murrumbella/hero-section"
import { TheLandSection } from "@/components/murrumbella/the-land-section"
import { TheRiverSection } from "@/components/murrumbella/the-river-section"
import { StorySection } from "@/components/murrumbella/story-section"
import { InvestmentSection } from "@/components/murrumbella/investment-section"
import { DevelopmentPathways } from "@/components/murrumbella/development-pathways"
import { EcologySection } from "@/components/murrumbella/ecology-section"
import { GallerySection } from "@/components/murrumbella/gallery-section"
import { LocationSection } from "@/components/murrumbella/location-section"
import { EnquirySection } from "@/components/murrumbella/enquiry-section"
import { MurrumbellaFooter } from "@/components/murrumbella/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <MurrumbellaHeader />
      <MurrumbellaHero />
      <TheLandSection />
      <TheRiverSection />
      <StorySection />
      <InvestmentSection />
      <DevelopmentPathways />
      <EcologySection />
      <GallerySection />
      <LocationSection />
      <EnquirySection />
      <MurrumbellaFooter />
    </main>
  )
}

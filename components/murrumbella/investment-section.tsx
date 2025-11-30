"use client"

import { motion } from "framer-motion"
import { Reveal } from "@/components/reveal"
import { Leaf, Home, Compass, Heart } from "lucide-react"

const investmentPillars = [
  {
    icon: Leaf,
    title: "Ecological Value",
    description:
      "The wildlife is constant and genuine. Wallabies and kangaroos move reliably through the landscape. Echidnas are seen often enough to be part of the property's personality. A living asset that appreciates through careful stewardship.",
    color: "var(--sage-grey)",
  },
  {
    icon: Home,
    title: "Lifestyle Asset",
    description:
      "Simple pleasures become daily options instead of holiday exceptions: fishing before breakfast, swimming in the river on hot afternoons, picnics under the trees, kids learning what an echidna looks like in the wild.",
    color: "var(--river-blue)",
  },
  {
    icon: Compass,
    title: "Strategic Position",
    description:
      "Around 40 minutes to Canberra's CBD, 30 minutes to Gungahlin light rail. As the crow flies, the outskirts of Canberra are just 6 kilometres away. Working from the hilltop is entirely possible with 5G coverage in spots.",
    color: "var(--copper-accent)",
  },
  {
    icon: Heart,
    title: "Cultural Heritage",
    description:
      "The Murrumbidgee holds deep significance. Directly opposite Brindabella Hills Winery and Pankhurst Wines, in one of the most tightly held stretches of riverfront near Canberra. Ownership carries privilege and responsibility.",
    color: "var(--clay-bark)",
  },
]

export function InvestmentSection() {
  return (
    <section id="investment" className="py-24 lg:py-32 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <Reveal>
          <div className="text-center mb-16 lg:mb-24">
            <p className="text-label text-[var(--sage-grey)] mb-4">Investment Thesis</p>
            <h2 className="text-heading text-4xl lg:text-5xl xl:text-6xl text-[var(--charcoal-ridge)] mb-6">
              Four Pillars of
              <br />
              Enduring Value
            </h2>
            <p className="text-body text-[var(--sage-grey)] max-w-2xl mx-auto">
              It is large enough that you can shape it into whatever you decide it should be over the next ten or twenty
              years — a single remarkable home, a network of retreats, a working rural holding, or a long-term land bank
              in the path of growth.
            </p>
          </div>
        </Reveal>

        {/* Investment Pillars Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16 lg:mb-24">
          {investmentPillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.1}>
              <motion.div
                className="p-8 lg:p-10 bg-[var(--murrumbella-cream)] rounded-lg border border-[var(--clay-bark)]/10 h-full"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <pillar.icon className="w-10 h-10 mb-6" style={{ color: pillar.color }} strokeWidth={1.5} />
                <h3 className="font-serif text-2xl text-[var(--charcoal-ridge)] mb-4">{pillar.title}</h3>
                <p className="text-body text-[var(--sage-grey)]">{pillar.description}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Market Context - Updated with Parkwood/Ginninderry context */}
        <Reveal delay={0.4}>
          <div className="grid lg:grid-cols-3 gap-8 p-8 lg:p-12 bg-[var(--charcoal-ridge)] rounded-lg">
            <div className="lg:col-span-1">
              <p className="text-label text-[var(--clay-bark)] mb-4">Market Position</p>
              <h3 className="font-serif text-2xl lg:text-3xl text-white">Path of Growth</h3>
            </div>
            <div className="lg:col-span-2">
              <p className="text-body text-white/70 mb-6">
                Buy once and decide how to structure it over time: a family compound, staged sales, investment splits,
                or simply an exit option later if the region continues to grow — as Parkwood and the wider Ginninderry
                vision suggest it will.
              </p>
              <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
                <div>
                  <p className="font-serif text-3xl text-white mb-1">6km</p>
                  <p className="text-xs text-white/50 uppercase tracking-wider">To Canberra Edge</p>
                </div>
                <div>
                  <p className="font-serif text-3xl text-white mb-1">4 Lots</p>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Subdivision Potential</p>
                </div>
                <div>
                  <p className="font-serif text-3xl text-white mb-1">DA</p>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Already Approved</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

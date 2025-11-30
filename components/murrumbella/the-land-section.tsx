"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Reveal } from "@/components/reveal"
import { MapPin, Mountain, Droplets, Route } from "lucide-react"

const landMetrics = [
  { icon: MapPin, label: "Total Area", value: "164.31 hectares" },
  { icon: Droplets, label: "River Frontage", value: "2.5 kilometres" },
  { icon: Route, label: "Internal Roads", value: "~3km formed track" },
  { icon: Mountain, label: "Terrain", value: "Hilly & undulating" },
]

export function TheLandSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], [50, -50])

  return (
    <section id="the-land" ref={containerRef} className="py-24 lg:py-32 bg-[var(--murrumbella-cream)]">
      <div className="container-custom">
        {/* Section Header - Updated copy */}
        <Reveal>
          <div className="text-center mb-16 lg:mb-24">
            <p className="text-label text-[var(--sage-grey)] mb-4">The Land</p>
            <h2 className="text-heading text-4xl lg:text-5xl xl:text-6xl text-[var(--charcoal-ridge)] mb-6">
              Not a Hobby Block.
              <br />
              Not a Weekend Plaything.
            </h2>
            <p className="text-body text-[var(--sage-grey)] max-w-3xl mx-auto">
              This is 164.31 hectares of cool climate country, directly opposite Brindabella Hills Winery and Pankhurst
              Wines, in one of the most tightly held stretches of riverfront near Canberra. Big enough to feel like its
              own world, close enough that the city is a choice, not an obligation.
            </p>
          </div>
        </Reveal>

        {/* Main Image Grid */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 mb-16 lg:mb-24">
          {/* Large Feature Image */}
          <Reveal className="lg:row-span-2">
            <motion.div
              className="relative h-[400px] lg:h-full min-h-[500px] rounded-lg overflow-hidden"
              style={{ y: imageY }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/aerial-topographic-map-view-of-australian-river-pr.jpg')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-label text-white/70 mb-2">The Property</p>
                <p className="font-serif text-xl text-white">
                  Follow the internal road as it winds across roughly 3 kilometres — the property reveals itself in
                  layers
                </p>
              </div>
            </motion.div>
          </Reveal>

          {/* Smaller Images */}
          <Reveal delay={0.1}>
            <div className="relative h-[280px] rounded-lg overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/australian-eucalyptus-woodland-morning-light-misty.jpg')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-sm text-white/80">Native Woodland</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="relative h-[280px] rounded-lg overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/open-pastoral-farmland-australian-countryside-roll.jpg')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-sm text-white/80">Cleared Paddocks</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Land Metrics */}
        <Reveal delay={0.3}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {landMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                className="text-center p-6 lg:p-8 bg-white rounded-lg border border-[var(--clay-bark)]/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <metric.icon className="w-8 h-8 text-[var(--river-blue)] mx-auto mb-4" strokeWidth={1.5} />
                <p className="font-serif text-xl lg:text-2xl text-[var(--charcoal-ridge)] mb-2">{metric.value}</p>
                <p className="text-sm text-[var(--sage-grey)] uppercase tracking-wider">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </Reveal>

        {/* Building Entitlement Notice - Updated with DA and subdivision details */}
        <Reveal delay={0.4}>
          <div className="mt-16 lg:mt-24 p-8 lg:p-12 bg-[var(--charcoal-ridge)] rounded-lg">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-label text-[var(--clay-bark)] mb-4">Building Entitlement</p>
                <h3 className="font-serif text-2xl lg:text-3xl text-white mb-4">Approved DA in Place</h3>
                <p className="text-body text-white/70">
                  The RU1 Rural zoning keeps the property genuinely rural while offering real flexibility. There is an
                  approved development application already in place to build. The idea of a home here is not just a
                  sketch — you can move straight into planning.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <p className="font-serif text-3xl text-white mb-1">4</p>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Potential Lots</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <p className="font-serif text-3xl text-white mb-1">~40ha</p>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Minimum Each</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg text-center col-span-2">
                  <p className="font-serif text-lg text-white mb-1">Riparian Water Rights</p>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Available for irrigation</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

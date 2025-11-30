"use client"

import { motion } from "framer-motion"
import { Reveal } from "@/components/reveal"

const wildlife = [
  { name: "Platypus", scientific: "Ornithorhynchus anatinus", category: "Mammal", status: "Protected" },
  { name: "Murray Cod", scientific: "Maccullochella peelii", category: "Fish", status: "Native" },
  { name: "Golden Perch", scientific: "Macquaria ambigua", category: "Fish", status: "Native" },
  { name: "Eastern Grey Kangaroo", scientific: "Macropus giganteus", category: "Mammal", status: "Common" },
  { name: "Wallaby", scientific: "Macropodidae", category: "Mammal", status: "Common" },
  { name: "Echidna", scientific: "Tachyglossus aculeatus", category: "Mammal", status: "Protected" },
  { name: "Wombat", scientific: "Vombatus ursinus", category: "Mammal", status: "Protected" },
]

const vegetation = [
  { name: "River Red Gum", scientific: "Eucalyptus camaldulensis", type: "Dominant canopy" },
  { name: "Casuarina", scientific: "Casuarina cunninghamiana", type: "River fringe" },
  { name: "Yellow Box", scientific: "Eucalyptus melliodora", type: "Woodland" },
  { name: "Blakely's Red Gum", scientific: "Eucalyptus blakelyi", type: "Woodland" },
]

export function EcologySection() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="container-custom">
        {/* Section Header - Updated copy */}
        <Reveal>
          <div className="text-center mb-16 lg:mb-24">
            <p className="text-label text-[var(--sage-grey)] mb-4">Ecology & Wildlife</p>
            <h2 className="text-heading text-4xl lg:text-5xl xl:text-6xl text-[var(--charcoal-ridge)] mb-6">
              The Wildlife is
              <br />
              Constant & Genuine
            </h2>
            <p className="text-body text-[var(--sage-grey)] max-w-2xl mx-auto">
              Wallabies and kangaroos move reliably through the landscape. Echidnas are seen often enough to be part of
              the property's personality rather than a rare sighting. The combination of cod, perch and platypus is the
              sort of thing that usually belongs in tourism copy for somewhere else.
            </p>
          </div>
        </Reveal>

        {/* Feature Wildlife Images */}
        <div className="grid md:grid-cols-3 gap-4 mb-16 lg:mb-24">
          <Reveal className="md:col-span-2 md:row-span-2">
            <div className="relative h-[300px] md:h-full min-h-[400px] rounded-lg overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('/river-red-gum-forest-murrumbidgee-australia-ancie.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-label text-white/70 mb-2">Native Habitat</p>
                <p className="font-serif text-2xl text-white">River Red Gum & Casuarina</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative h-[200px] rounded-lg overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('/australian-river-platypus-habitat-calm-water-nativ.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-sm text-white">Platypus work the edges when quiet</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="relative h-[200px] rounded-lg overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('/australian-native-birds-eucalyptus-tree-morning-li.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-sm text-white">Birds work the thermals and trees</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Wildlife & Vegetation Data */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Wildlife */}
          <Reveal delay={0.3}>
            <div className="p-6 lg:p-8 bg-[var(--murrumbella-cream)] rounded-lg">
              <h3 className="font-serif text-2xl text-[var(--charcoal-ridge)] mb-6">Recorded Species</h3>
              <div className="space-y-4">
                {wildlife.map((species, index) => (
                  <motion.div
                    key={species.name}
                    className="flex items-center justify-between py-3 border-b border-[var(--clay-bark)]/20 last:border-0"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div>
                      <p className="font-medium text-[var(--charcoal-ridge)]">{species.name}</p>
                      <p className="text-sm text-[var(--sage-grey)] italic">{species.scientific}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          species.status === "Protected"
                            ? "bg-[var(--river-blue)]/10 text-[var(--river-blue)]"
                            : "bg-[var(--sage-grey)]/10 text-[var(--sage-grey)]"
                        }`}
                      >
                        {species.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Vegetation */}
          <Reveal delay={0.4}>
            <div className="p-6 lg:p-8 bg-[var(--murrumbella-cream)] rounded-lg">
              <h3 className="font-serif text-2xl text-[var(--charcoal-ridge)] mb-6">Native Vegetation</h3>
              <div className="space-y-4">
                {vegetation.map((plant, index) => (
                  <motion.div
                    key={plant.name}
                    className="flex items-center justify-between py-3 border-b border-[var(--clay-bark)]/20 last:border-0"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div>
                      <p className="font-medium text-[var(--charcoal-ridge)]">{plant.name}</p>
                      <p className="text-sm text-[var(--sage-grey)] italic">{plant.scientific}</p>
                    </div>
                    <p className="text-sm text-[var(--sage-grey)]">{plant.type}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-[var(--river-blue)]/5 rounded border border-[var(--river-blue)]/20">
                <p className="text-sm text-[var(--charcoal-ridge)]">
                  <strong>Accessible River Frontage</strong> — Long, usable, private stretches of water with the sort of
                  river frontage people talk about but rarely find.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

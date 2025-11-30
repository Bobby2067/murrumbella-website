"use client"

import { motion } from "framer-motion"
import { Reveal } from "@/components/reveal"
import { Shield, Building, Grid3X3, TreePine, Sprout } from "lucide-react"

const pathways = [
  {
    icon: Shield,
    title: "Private Estate",
    description:
      "A house placed high on a ridge with views over the river, the valley and the distant city lights. Space for sheds, workshops, maybe even a private helicopter landing area or short strip for light aircraft, subject to approvals.",
    image: "/modern-australian-homestead-river-view-architectur.jpg",
  },
  {
    icon: Building,
    title: "Eco-Tourism Retreat",
    description:
      "Riverfront camping platforms, glamping tents pitched under the stars, discreet eco cabins tucked into the hillside. Guests spend mornings walking through bush tracks, afternoons at the wineries across the road, evenings listening to the night birds.",
    image: "/luxury-eco-lodge-australian-bush-timber-architectu.jpg",
  },
  {
    icon: Grid3X3,
    title: "Rural Subdivision",
    description:
      "Under current planning controls, 424 Horseshoe Road is eligible to be subdivided into up to four separate lots of around 40 hectares or more. A family compound, staged sales, investment splits, or an exit option as the region grows.",
    image: "/aerial-rural-subdivision-australian-landscape.jpg",
  },
  {
    icon: TreePine,
    title: "Conservation Covenant",
    description:
      "Protect the land in perpetuity through conservation mechanisms. Potential tax benefits while ensuring ecological preservation of the river corridor and native bushland.",
    image: "/australian-conservation-reserve-native-bushland-ri.jpg",
  },
  {
    icon: Sprout,
    title: "Regenerative Enterprise",
    description:
      "A working rural holding with a side of tourism. Regenerative agriculture, carbon farming, or native revegetation enterprise. Align investment returns with environmental outcomes while the cleared paddocks give you options.",
    image: "/regenerative-farm-australian-landscape-native-gras.jpg",
  },
]

export function DevelopmentPathways() {
  return (
    <section className="py-24 lg:py-32 bg-[var(--murrumbella-mist)]">
      <div className="container-custom">
        {/* Section Header */}
        <Reveal>
          <div className="text-center mb-16 lg:mb-24">
            <p className="text-label text-[var(--sage-grey)] mb-4">Development Pathways</p>
            <h2 className="text-heading text-4xl lg:text-5xl xl:text-6xl text-[var(--charcoal-ridge)] mb-6">
              Five Ways Forward
            </h2>
            <p className="text-body text-[var(--sage-grey)] max-w-2xl mx-auto">
              The possibilities for use are broad without feeling speculative. Each pathway offers a distinct
              relationship with the property — from personal retreat to conservation legacy.
            </p>
          </div>
        </Reveal>

        {/* Pathways */}
        <div className="space-y-8 lg:space-y-12">
          {pathways.map((pathway, index) => (
            <Reveal key={pathway.title} delay={index * 0.1}>
              <motion.div
                className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.4 }}
              >
                {/* Image */}
                <div
                  className={`relative h-[300px] lg:h-[400px] rounded-lg overflow-hidden ${
                    index % 2 === 1 ? "lg:order-2" : ""
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url('${pathway.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Content */}
                <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--river-blue)]/10 flex items-center justify-center">
                      <pathway.icon className="w-6 h-6 text-[var(--river-blue)]" strokeWidth={1.5} />
                    </div>
                    <span className="text-label text-[var(--sage-grey)]">Pathway {index + 1}</span>
                  </div>
                  <h3 className="font-serif text-2xl lg:text-3xl text-[var(--charcoal-ridge)] mb-4">{pathway.title}</h3>
                  <p className="text-body text-[var(--sage-grey)] mb-6">{pathway.description}</p>
                  <a
                    href="/dossier"
                    className="inline-flex items-center text-sm font-medium text-[var(--copper-accent)] hover:text-[var(--copper-accent)]/80 transition-colors"
                  >
                    Learn more in the Private Dossier
                    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

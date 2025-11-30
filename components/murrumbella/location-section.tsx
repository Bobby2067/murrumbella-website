"use client"

import { motion } from "framer-motion"
import { Reveal } from "@/components/reveal"
import { Clock, Plane, Car, MapPin, Wifi, Train } from "lucide-react"

const travelTimes = [
  { destination: "Canberra CBD", time: "~40 minutes", icon: Car },
  { destination: "Gungahlin Light Rail", time: "~30 minutes", icon: Train },
  { destination: "Canberra Outskirts", time: "6km as crow flies", icon: MapPin },
  { destination: "Canberra Airport", time: "~45 minutes", icon: Plane },
]

export function LocationSection() {
  return (
    <section className="py-24 lg:py-32 bg-[var(--charcoal-ridge)]">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Map Illustration */}
          <Reveal>
            <div className="relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-[var(--charcoal-ridge-light)]">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-80"
                style={{ backgroundImage: `url('/stylized-map-nsw-australia-murrumbidgee-river-regi.jpg')` }}
              />
              {/* Location Pin */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <div className="w-16 h-16 bg-[var(--copper-accent)] rounded-full flex items-center justify-center shadow-lg">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--copper-accent)] rotate-45" />
              </motion.div>
            </div>
          </Reveal>

          {/* Location Info - Updated copy */}
          <div>
            <Reveal>
              <p className="text-label text-[var(--clay-bark)] mb-4">Location & Access</p>
              <h2 className="text-heading text-4xl lg:text-5xl text-white mb-6">
                Close Enough That
                <br />
                The City Is a Choice
              </h2>
              <p className="text-body text-white/70 mb-8">
                From the front gate, around 40 minutes to Canberra's CBD and about 30 minutes to Gungahlin light rail.
                As the crow flies, the outskirts of Canberra are just 6 kilometres away. You can step out of a meeting
                and straight into bushland without ever getting on a plane.
              </p>
            </Reveal>

            {/* 5G Notice */}
            <Reveal delay={0.1}>
              <div className="flex items-center gap-3 mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
                <Wifi className="w-5 h-5 text-[var(--clay-bark)]" />
                <p className="text-sm text-white/70">
                  Signal bars flicker to full in places across the property, with 5G coverage in spots. Video calls from
                  the verandah are entirely possible.
                </p>
              </div>
            </Reveal>

            {/* Travel Times */}
            <Reveal delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {travelTimes.map((item, index) => (
                  <motion.div
                    key={item.destination}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <item.icon className="w-5 h-5 text-[var(--clay-bark)] mb-3" strokeWidth={1.5} />
                    <p className="font-serif text-lg text-white mb-1">{item.destination}</p>
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <Clock className="w-3 h-3" />
                      <span>{item.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <p className="text-sm text-white/50 mt-6">
                424 Horseshoe Road, Mullion • Opposite Brindabella Hills Winery & Pankhurst Wines
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

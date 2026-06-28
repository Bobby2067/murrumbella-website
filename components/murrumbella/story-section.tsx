"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Reveal } from "@/components/reveal"

export function StorySection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], [50, -50])

  return (
    <section ref={containerRef} className="py-24 lg:py-32 bg-[var(--murrumbella-cream)] overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <Reveal>
            <motion.div className="relative h-[400px] lg:h-[600px] rounded-lg overflow-hidden" style={{ y: imageY }}>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/ancient-eucalyptus-riverside-australian-landscape-.jpg')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </motion.div>
          </Reveal>

          {/* Story Content - Updated with narrative copy */}
          <div className="lg:py-12">
            <Reveal>
              <p className="text-label text-[var(--sage-grey)] mb-4">The Story of Place</p>
              <h2 className="text-heading text-4xl lg:text-5xl text-[var(--charcoal-ridge)] mb-8">
                A Canvas With the
                <br />
                Hard Work Done
              </h2>
            </Reveal>

            <div className="space-y-6">
              <Reveal delay={0.1}>
                <p className="text-body text-[var(--sage-grey)] text-lg leading-relaxed">
                  Hilly and undulating, the property offers vantage points that look over valleys and ridgelines, with
                  Telstra Tower visible in the distance — a quiet reminder that the capital is still just over there, on
                  the other side of the horizon.
                </p>
              </Reveal>

              <Reveal delay={0.2}>
                <p className="text-body text-[var(--sage-grey)] leading-relaxed">
                  Pockets of cleared country open between the trees. These paddocks give you options. Run some stock,
                  investigate a rural enterprise, or simply keep them as open, grassy spaces while future uses are
                  assessed.
                </p>
              </Reveal>

              <Reveal delay={0.3}>
                <p className="text-body text-[var(--sage-grey)] leading-relaxed">
                  In the end, 424 Horseshoe Road is not just a rural block or a lifestyle property. It is a canvas with
                  the fundamentals visible where they matter: position, river, access, planning context and scale. The
                  rest is a decision about the story you want to write here.
                </p>
              </Reveal>

              <Reveal delay={0.4}>
                <blockquote className="mt-10 pl-6 border-l-2 border-[var(--copper-accent)]">
                  <p className="font-serif text-xl lg:text-2xl text-[var(--charcoal-ridge)] italic leading-relaxed">
                    "This place is ready for that next chapter."
                  </p>
                </blockquote>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

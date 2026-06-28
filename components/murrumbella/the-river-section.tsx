"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Reveal } from "@/components/reveal"

export function TheRiverSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], [100, -100])
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.4, 0.6, 0.8], [0, 1, 1, 0])

  return (
    <section id="the-river" ref={containerRef} className="relative min-h-[150vh] overflow-hidden">
      {/* Parallax Background */}
      <motion.div className="sticky top-0 h-screen w-full" style={{ y: parallaxY }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/murrumbidgee-river-at-dawn-soft-morning-mist-eucal.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
      </motion.div>

      {/* Overlay Content - Updated with narrative copy */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div className="text-center px-6 max-w-4xl" style={{ opacity: textOpacity }}>
          <Reveal>
            <p className="text-label text-white/60 mb-6">2.5 Kilometres of Frontage</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-display text-white mb-8">
              The River
              <br />
              Slows Everything
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-body text-white/80 text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
              Down by the river, the pace slows naturally. Casuarinas and river gums frame long, accessible stretches of
              water. Murray cod and golden perch hold in the deeper runs. Platypus work the edges when the river is
              quiet. If you sit still long enough, the bush tends to forget you are there.
            </p>
          </Reveal>
        </motion.div>
      </div>

      {/* Sensory Details Strip - Updated details */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <Reveal delay={0.3}>
              <div>
                <p className="font-serif text-2xl text-white mb-2">Murray Cod</p>
                <p className="text-sm text-white/60">Stories of impressive fish from these bends</p>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div>
                <p className="font-serif text-2xl text-white mb-2">Platypus</p>
                <p className="text-sm text-white/60">Working the edges at dawn and dusk</p>
              </div>
            </Reveal>
            <Reveal delay={0.5}>
              <div>
                <p className="font-serif text-2xl text-white mb-2">River Due Diligence</p>
                <p className="text-sm text-white/60">Confirm any access or extraction rights independently</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

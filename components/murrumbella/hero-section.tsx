"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ChevronDown } from "lucide-react"

export function MurrumbellaHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.4], [0, -50])

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Background Video/Image Container */}
      <motion.div className="absolute inset-0" style={{ scale: imageScale, y: imageY }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/aerial-view-of-australian-river-landscape-with-euc.jpg')`,
          }}
        />
        {/* Cinematic overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-center px-6"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="text-center text-white max-w-5xl mx-auto">
          {/* Eyebrow - Updated address */}
          <motion.p
            className="text-label text-white/70 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            424 Horseshoe Road, Mullion
          </motion.p>

          {/* Main Title */}
          <motion.h1
            className="text-display text-white mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <span className="block">Murrumbella</span>
          </motion.h1>

          {/* Subtitle - Updated with cinematic opening narrative */}
          <motion.p
            className="text-body text-white/90 max-w-2xl mx-auto mb-10 text-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Morning comes quietly to 424 Horseshoe Road. Light spills over the Brindabellas, slipping through the gums
            and tracing the folds of the hills. Below, the Murrumbidgee moves steadily past.
          </motion.p>

          {/* CTA */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <a
              href="#the-land"
              className="px-8 py-4 bg-white text-[var(--charcoal-ridge)] font-sans font-medium text-sm tracking-wide rounded hover:bg-white/90 transition-colors duration-300"
            >
              Explore the Land
            </a>
            <a
              href="/dossier"
              className="px-8 py-4 bg-transparent text-white border border-white/40 font-sans font-medium text-sm tracking-wide rounded hover:bg-white/10 transition-colors duration-300"
            >
              Request Private Dossier
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Key Facts Strip - Updated with accurate metrics */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <div className="bg-black/30 backdrop-blur-md border-t border-white/10">
          <div className="container-custom py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl lg:text-3xl font-serif text-white mb-1">164.31</p>
                <p className="text-xs text-white/60 tracking-wider uppercase">Hectares</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-serif text-white mb-1">2.5km</p>
                <p className="text-xs text-white/60 tracking-wider uppercase">River Frontage</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-serif text-white mb-1">40min</p>
                <p className="text-xs text-white/60 tracking-wider uppercase">To Canberra</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-serif text-white mb-1">RU1</p>
                <p className="text-xs text-white/60 tracking-wider uppercase">Rural Zoning</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  )
}

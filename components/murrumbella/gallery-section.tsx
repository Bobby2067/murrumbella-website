"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Reveal } from "@/components/reveal"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

const galleryImages = [
  { src: "/aerial-view-of-australian-river-landscape-with-euc.jpg", alt: "Aerial view of Murrumbella and the Murrumbidgee", category: "Aerial" },
  { src: "/murrumbidgee-river-at-dawn-soft-morning-mist-eucal.jpg", alt: "Murrumbidgee River at dawn with morning mist", category: "River" },
  { src: "/australian-eucalyptus-woodland-morning-light-misty.jpg", alt: "Native eucalypt woodland in morning light", category: "Landscape" },
  { src: "/aerial-topographic-map-view-of-australian-river-pr.jpg", alt: "Aerial topographic view of the river corridor", category: "Aerial" },
  { src: "/open-pastoral-farmland-australian-countryside-roll.jpg", alt: "Rolling open pastoral land", category: "Landscape" },
  { src: "/regenerative-farm-australian-landscape-native-gras.jpg", alt: "Regenerative farmland with native grasses", category: "Landscape" },
  { src: "/australian-conservation-reserve-native-bushland-ri.jpg", alt: "Native bushland conservation reserve", category: "Wildlife" },
  { src: "/aerial-rural-subdivision-australian-landscape.jpg", alt: "Aerial view of the rural subdivision potential", category: "Aerial" },
  { src: "/luxury-eco-lodge-australian-bush-timber-architectu.jpg", alt: "Luxury eco-lodge architecture in the Australian bush", category: "Atmosphere" },
  { src: "/modern-australian-homestead-river-view-architectur.jpg", alt: "Modern homestead with river views", category: "Atmosphere" },
]

const categories = ["All", "Aerial", "River", "Landscape", "Atmosphere", "Wildlife"]

export function GallerySection() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [lightboxImage, setLightboxImage] = useState<number | null>(null)

  const filteredImages =
    selectedCategory === "All" ? galleryImages : galleryImages.filter((img) => img.category === selectedCategory)

  const openLightbox = (index: number) => setLightboxImage(index)
  const closeLightbox = () => setLightboxImage(null)

  const nextImage = () => {
    if (lightboxImage !== null) {
      setLightboxImage((lightboxImage + 1) % filteredImages.length)
    }
  }

  const prevImage = () => {
    if (lightboxImage !== null) {
      setLightboxImage((lightboxImage - 1 + filteredImages.length) % filteredImages.length)
    }
  }

  return (
    <section id="gallery" className="py-24 lg:py-32 bg-[var(--murrumbella-cream)]">
      <div className="container-custom">
        {/* Section Header */}
        <Reveal>
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-label text-[var(--sage-grey)] mb-4">Gallery</p>
            <h2 className="text-heading text-4xl lg:text-5xl xl:text-6xl text-[var(--charcoal-ridge)] mb-6">
              Visual Journey
            </h2>
            <p className="text-body text-[var(--sage-grey)] max-w-2xl mx-auto">
              Experience Murrumbella through our curated collection of imagery — from sweeping aerials to intimate
              moments of natural beauty.
            </p>
          </div>
        </Reveal>

        {/* Category Filter */}
        <Reveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-[var(--charcoal-ridge)] text-white"
                    : "bg-white text-[var(--sage-grey)] hover:bg-[var(--charcoal-ridge)]/5"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Gallery Grid */}
        <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" layout>
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`relative cursor-pointer overflow-hidden rounded-lg ${
                  index === 0 ? "col-span-2 row-span-2" : ""
                }`}
                onClick={() => openLightbox(index)}
              >
                <div className={`relative ${index === 0 ? "h-[400px] lg:h-[500px]" : "h-[200px] lg:h-[240px]"}`}>
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-110"
                    style={{ backgroundImage: `url('${image.src}')` }}
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
              aria-label="Close lightbox"
            >
              <X size={32} />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-6 text-white/70 hover:text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={48} />
            </button>

            <motion.div
              key={lightboxImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-5xl max-h-[80vh] px-16"
            >
              <div
                className="w-full h-[70vh] bg-cover bg-center rounded-lg"
                style={{ backgroundImage: `url('${filteredImages[lightboxImage].src}')` }}
              />
              <p className="text-center text-white/70 mt-4">{filteredImages[lightboxImage].alt}</p>
            </motion.div>

            <button
              onClick={nextImage}
              className="absolute right-6 text-white/70 hover:text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={48} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

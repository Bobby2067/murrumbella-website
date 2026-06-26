"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Reveal } from "@/components/reveal"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

const galleryImages = [
  { src: "/photos/IMG_2724.jpg", alt: "Murrumbella property" },
  { src: "/photos/IMG_2741.jpg", alt: "Murrumbella property" },
  { src: "/photos/IMG_2756.jpg", alt: "Murrumbella property" },
  { src: "/photos/IMG_2826.jpg", alt: "Murrumbella property" },
  { src: "/photos/IMG_2831.jpg", alt: "Murrumbella property" },
  { src: "/photos/IMG_2836.jpg", alt: "Murrumbella property" },
  { src: "/photos/IMG_2841.jpg", alt: "Murrumbella property" },
  { src: "/photos/IMG_2864.jpg", alt: "Murrumbella property" },
  { src: "/photos/IMG_2869.jpg", alt: "Murrumbella property" },
  { src: "/photos/IMG_6519.JPEG", alt: "Murrumbella property" },
  { src: "/photos/IMG_6522.JPEG", alt: "Murrumbella property" },
  { src: "/photos/IMG_6527.JPEG", alt: "Murrumbella property" },
]

export function GallerySection() {
  const [lightboxImage, setLightboxImage] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxImage(index)
  const closeLightbox = () => setLightboxImage(null)

  const nextImage = () => {
    if (lightboxImage !== null) {
      setLightboxImage((lightboxImage + 1) % galleryImages.length)
    }
  }

  const prevImage = () => {
    if (lightboxImage !== null) {
      setLightboxImage((lightboxImage - 1 + galleryImages.length) % galleryImages.length)
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

        {/* Gallery Grid */}
        <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" layout>
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.src}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
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
                style={{ backgroundImage: `url('${galleryImages[lightboxImage].src}')` }}
              />
              <p className="text-center text-white/70 mt-4">{galleryImages[lightboxImage].alt}</p>
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

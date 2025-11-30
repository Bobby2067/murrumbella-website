"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import Link from "next/link"

const navItems = [
  { name: "The Land", href: "#the-land" },
  { name: "The River", href: "#the-river" },
  { name: "Investment", href: "#investment" },
  { name: "Gallery", href: "#gallery" },
  { name: "Enquire", href: "#enquire" },
]

export function MurrumbellaHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-[var(--murrumbella-cream)]/95 backdrop-blur-md border-b border-[var(--clay-bark)]/20"
            : "bg-transparent",
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div className="flex-shrink-0" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Link
                href="/"
                className={cn(
                  "font-serif text-xl lg:text-2xl font-medium tracking-wide transition-colors duration-300",
                  isScrolled ? "text-[var(--charcoal-ridge)]" : "text-white",
                )}
              >
                MURRUMBELLA
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-sans font-medium tracking-wide transition-colors duration-300",
                    isScrolled
                      ? "text-[var(--charcoal-ridge)]/70 hover:text-[var(--charcoal-ridge)]"
                      : "text-white/80 hover:text-white",
                  )}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name}
                </motion.a>
              ))}
              <motion.a
                href="/dossier"
                className={cn(
                  "px-5 py-2.5 text-sm font-sans font-medium tracking-wide rounded transition-all duration-300",
                  isScrolled
                    ? "bg-[var(--charcoal-ridge)] text-white hover:bg-[var(--charcoal-ridge)]/90"
                    : "bg-white/10 text-white border border-white/30 hover:bg-white/20",
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Private Dossier
              </motion.a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className={cn(
                "lg:hidden p-2 transition-colors duration-300",
                isScrolled ? "text-[var(--charcoal-ridge)]" : "text-white",
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[var(--murrumbella-cream)] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="font-serif text-2xl text-[var(--charcoal-ridge)]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </motion.a>
              ))}
              <motion.a
                href="/dossier"
                className="mt-4 px-8 py-3 bg-[var(--charcoal-ridge)] text-white font-sans font-medium rounded"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Private Dossier
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

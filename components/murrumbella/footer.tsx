"use client"

import { motion } from "framer-motion"
import Link from "next/link"

const footerLinks = {
  Explore: [
    { name: "The Land", href: "/#the-land" },
    { name: "The River", href: "/#the-river" },
    { name: "Investment Thesis", href: "/#investment" },
    { name: "Gallery", href: "/#gallery" },
  ],
  Information: [
    { name: "Private Dossier", href: "/dossier" },
    { name: "Expression of Interest", href: "/#enquire" },
    { name: "Contact", href: "/#enquire" },
  ],
}

export function MurrumbellaFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[var(--charcoal-ridge)] text-white">
      <div className="container-custom py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-12">
          {/* Brand */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="font-serif text-3xl mb-4 inline-block hover:text-white/80 transition-colors">
              Murrumbella
            </Link>
            <p className="text-white/60 leading-relaxed max-w-md mt-4">
              406 acres on the Murrumbidgee River, NSW Australia. Rural zoning with full building entitlement. Offered
              for private sale by expression of interest.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <p className="text-sm text-white/40">Enquiries</p>
              <a
                href="mailto:enquiries@murrumbella.com.au"
                className="text-[var(--copper-accent)] hover:text-[var(--copper-accent)]/80 transition-colors"
              >
                enquiries@murrumbella.com.au
              </a>
            </div>
          </motion.div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <h4 className="text-label text-white/40 mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-white/70 hover:text-white transition-colors duration-200">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <motion.div
          className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-sm text-white/40">&copy; {currentYear} Murrumbella. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white/60 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white/60 transition-colors">
              Terms of Use
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MurrumbellaHeader } from "@/components/murrumbella/header"
import { MurrumbellaFooter } from "@/components/murrumbella/footer"
import { Lock, FileText, Download, Eye, ChevronRight, Check, AlertCircle } from "lucide-react"
import { Reveal } from "@/components/reveal"

// Demo password for the prototype
const DEMO_PASSWORD = "murrumbella2024"

const dossierDocuments = [
  {
    title: "Information Memorandum",
    description:
      "Complete property overview including legal description, zoning details, and development potential analysis.",
    pages: 48,
    type: "PDF",
    size: "12.4 MB",
  },
  {
    title: "Survey & Title Documents",
    description: "Current survey, certificate of title, and boundary information.",
    pages: 12,
    type: "PDF",
    size: "8.2 MB",
  },
  {
    title: "Ecological Assessment",
    description: "Flora and fauna study conducted by accredited environmental consultants.",
    pages: 34,
    type: "PDF",
    size: "15.8 MB",
  },
  {
    title: "Water Rights Documentation",
    description: "River access entitlements, water licenses, and riparian rights documentation.",
    pages: 8,
    type: "PDF",
    size: "2.1 MB",
  },
  {
    title: "Development Feasibility Studies",
    description: "Preliminary assessments for various development scenarios.",
    pages: 28,
    type: "PDF",
    size: "9.6 MB",
  },
  {
    title: "High-Resolution Imagery Pack",
    description: "Aerial photography, drone footage stills, and professional landscape photography.",
    pages: null,
    type: "ZIP",
    size: "245 MB",
  },
]

export default function DossierPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (password === DEMO_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      setError("Invalid access code. Please contact us to request access.")
    }
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-[var(--murrumbella-cream)]">
      <MurrumbellaHeader />

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          // Password Gate
          <motion.div
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center px-6 pt-20"
          >
            <div className="w-full max-w-md">
              <Reveal>
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-[var(--charcoal-ridge)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="font-serif text-3xl lg:text-4xl text-[var(--charcoal-ridge)] mb-4">Private Dossier</h1>
                  <p className="text-body text-[var(--sage-grey)]">
                    Access to the Murrumbella Information Memorandum and supporting documentation requires an access
                    code.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Access Code
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter access code"
                      className="w-full px-5 py-4 bg-white border border-[var(--clay-bark)]/30 rounded-lg text-[var(--charcoal-ridge)] placeholder:text-[var(--sage-grey)] focus:outline-none focus:ring-2 focus:ring-[var(--river-blue)] focus:border-transparent transition-all"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-[var(--copper-accent)] text-sm"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !password}
                    className="w-full px-6 py-4 bg-[var(--charcoal-ridge)] text-white font-medium rounded-lg hover:bg-[var(--charcoal-ridge)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                    ) : (
                      <>
                        Access Dossier
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="mt-8 p-5 bg-[var(--river-blue)]/5 rounded-lg border border-[var(--river-blue)]/20">
                  <p className="text-sm text-[var(--charcoal-ridge)]">
                    <strong>Need access?</strong> Submit an expression of interest or contact us directly to receive
                    your private access code.
                  </p>
                  <a
                    href="/#enquire"
                    className="inline-flex items-center mt-3 text-sm text-[var(--copper-accent)] hover:text-[var(--copper-accent)]/80 transition-colors"
                  >
                    Request Access
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </Reveal>

              <Reveal delay={0.3}>
                <p className="text-center text-xs text-[var(--sage-grey)] mt-8">
                  Demo access code: <code className="bg-[var(--clay-bark)]/20 px-2 py-1 rounded">murrumbella2024</code>
                </p>
              </Reveal>
            </div>
          </motion.div>
        ) : (
          // Authenticated Dossier View
          <motion.div key="dossier" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 pb-16">
            {/* Header */}
            <div className="bg-[var(--charcoal-ridge)] py-16 lg:py-20">
              <div className="container-custom">
                <Reveal>
                  <div className="flex items-center gap-3 text-[var(--clay-bark)] mb-4">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium tracking-wider uppercase">Access Granted</span>
                  </div>
                  <h1 className="font-serif text-4xl lg:text-5xl text-white mb-4">Private Dossier</h1>
                  <p className="text-body text-white/70 max-w-2xl">
                    Welcome to the Murrumbella private document repository. Below you will find the Information
                    Memorandum and all supporting documentation for your due diligence.
                  </p>
                </Reveal>
              </div>
            </div>

            {/* Documents Grid */}
            <div className="container-custom py-12 lg:py-16">
              <Reveal>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-2xl text-[var(--charcoal-ridge)]">Available Documents</h2>
                  <button className="text-sm text-[var(--copper-accent)] hover:text-[var(--copper-accent)]/80 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download All
                  </button>
                </div>
              </Reveal>

              <div className="grid md:grid-cols-2 gap-4">
                {dossierDocuments.map((doc, index) => (
                  <Reveal key={doc.title} delay={index * 0.05}>
                    <motion.div
                      className="p-6 bg-white rounded-lg border border-[var(--clay-bark)]/20 hover:border-[var(--clay-bark)]/40 transition-all group"
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[var(--murrumbella-cream)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-[var(--river-blue)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[var(--charcoal-ridge)] mb-1 group-hover:text-[var(--river-blue)] transition-colors">
                            {doc.title}
                          </h3>
                          <p className="text-sm text-[var(--sage-grey)] mb-3 line-clamp-2">{doc.description}</p>
                          <div className="flex items-center gap-4 text-xs text-[var(--sage-grey)]">
                            <span className="px-2 py-1 bg-[var(--murrumbella-cream)] rounded">{doc.type}</span>
                            <span>{doc.size}</span>
                            {doc.pages && <span>{doc.pages} pages</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="p-2 text-[var(--sage-grey)] hover:text-[var(--river-blue)] hover:bg-[var(--river-blue)]/5 rounded transition-colors"
                            aria-label="Preview document"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            className="p-2 text-[var(--sage-grey)] hover:text-[var(--copper-accent)] hover:bg-[var(--copper-accent)]/5 rounded transition-colors"
                            aria-label="Download document"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </Reveal>
                ))}
              </div>

              {/* Confidentiality Notice */}
              <Reveal delay={0.4}>
                <div className="mt-12 p-6 bg-[var(--charcoal-ridge)]/5 rounded-lg border border-[var(--charcoal-ridge)]/10">
                  <h4 className="font-medium text-[var(--charcoal-ridge)] mb-2">Confidentiality Notice</h4>
                  <p className="text-sm text-[var(--sage-grey)]">
                    The information contained in this dossier is confidential and intended solely for the recipient. Any
                    distribution, reproduction, or disclosure without the express consent of the vendors is strictly
                    prohibited. By accessing these documents, you acknowledge your acceptance of these terms.
                  </p>
                </div>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MurrumbellaFooter />
    </main>
  )
}

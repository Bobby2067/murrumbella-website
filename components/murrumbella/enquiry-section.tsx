"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Reveal } from "@/components/reveal"
import { Send, Check, User, Mail, Phone, MessageSquare } from "lucide-react"

export function EnquirySection() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <section id="enquire" className="py-24 lg:py-32 bg-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column - Info */}
          <div>
            <Reveal>
              <p className="text-label text-[var(--sage-grey)] mb-4">Expression of Interest</p>
              <h2 className="text-heading text-4xl lg:text-5xl text-[var(--charcoal-ridge)] mb-6">
                Begin the
                <br />
                Conversation
              </h2>
              <p className="text-body text-[var(--sage-grey)] mb-8">
                Murrumbella is offered for private sale by expression of interest. Complete the form to receive the
                Information Memorandum and arrange a private inspection.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--river-blue)]/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-lg text-[var(--river-blue)]">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--charcoal-ridge)] mb-1">Submit Interest</h4>
                    <p className="text-sm text-[var(--sage-grey)]">
                      Complete the expression of interest form with your details.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--river-blue)]/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-lg text-[var(--river-blue)]">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--charcoal-ridge)] mb-1">Receive Dossier</h4>
                    <p className="text-sm text-[var(--sage-grey)]">
                      Gain access to the private Information Memorandum.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--river-blue)]/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-lg text-[var(--river-blue)]">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--charcoal-ridge)] mb-1">Private Inspection</h4>
                    <p className="text-sm text-[var(--sage-grey)]">
                      Arrange a guided tour of the property at your convenience.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-10 pt-10 border-t border-[var(--clay-bark)]/20">
                <h4 className="font-medium text-[var(--charcoal-ridge)] mb-4">Direct Enquiries</h4>
                <a
                  href="mailto:enquiries@murrumbella.com.au"
                  className="text-[var(--copper-accent)] hover:text-[var(--copper-accent)]/80 transition-colors"
                >
                  enquiries@murrumbella.com.au
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right Column - Form */}
          <Reveal delay={0.1}>
            <div className="bg-[var(--murrumbella-cream)] p-8 lg:p-10 rounded-lg">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-[var(--sage-grey)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-serif text-2xl text-[var(--charcoal-ridge)] mb-4">Thank You</h3>
                  <p className="text-body text-[var(--sage-grey)]">
                    Your expression of interest has been received. We will be in touch within 24-48 hours with access to
                    the private dossier.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[var(--charcoal-ridge)] mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--sage-grey)]" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formState.name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[var(--clay-bark)]/30 rounded-lg text-[var(--charcoal-ridge)] placeholder:text-[var(--sage-grey)] focus:outline-none focus:ring-2 focus:ring-[var(--river-blue)] focus:border-transparent transition-all"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--charcoal-ridge)] mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--sage-grey)]" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formState.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[var(--clay-bark)]/30 rounded-lg text-[var(--charcoal-ridge)] placeholder:text-[var(--sage-grey)] focus:outline-none focus:ring-2 focus:ring-[var(--river-blue)] focus:border-transparent transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-[var(--charcoal-ridge)] mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--sage-grey)]" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formState.phone}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[var(--clay-bark)]/30 rounded-lg text-[var(--charcoal-ridge)] placeholder:text-[var(--sage-grey)] focus:outline-none focus:ring-2 focus:ring-[var(--river-blue)] focus:border-transparent transition-all"
                        placeholder="+61 xxx xxx xxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="interest" className="block text-sm font-medium text-[var(--charcoal-ridge)] mb-2">
                      Primary Interest *
                    </label>
                    <select
                      id="interest"
                      name="interest"
                      required
                      value={formState.interest}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-[var(--clay-bark)]/30 rounded-lg text-[var(--charcoal-ridge)] focus:outline-none focus:ring-2 focus:ring-[var(--river-blue)] focus:border-transparent transition-all"
                    >
                      <option value="">Select your interest</option>
                      <option value="private-buyer">Private Buyer</option>
                      <option value="investor">Property Investor</option>
                      <option value="developer">Developer</option>
                      <option value="agent">Buyer's Agent</option>
                      <option value="conservation">Conservation / Land Trust</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[var(--charcoal-ridge)] mb-2">
                      Message
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-[var(--sage-grey)]" />
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formState.message}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[var(--clay-bark)]/30 rounded-lg text-[var(--charcoal-ridge)] placeholder:text-[var(--sage-grey)] focus:outline-none focus:ring-2 focus:ring-[var(--river-blue)] focus:border-transparent transition-all resize-none"
                        placeholder="Tell us about your interest in Murrumbella..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 bg-[var(--charcoal-ridge)] text-white font-medium rounded-lg hover:bg-[var(--charcoal-ridge)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                    ) : (
                      <>
                        Submit Expression of Interest
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-[var(--sage-grey)] text-center">
                    By submitting, you agree to receive communications regarding Murrumbella. Your information will be
                    kept confidential.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

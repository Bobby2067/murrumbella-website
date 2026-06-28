"use client"

import {
  ArrowUpRight,
  Check,
  ChevronRight,
  ExternalLink,
  Loader2,
  MessageCircle,
  Send,
  UserRound,
  X,
} from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react"

import styles from "./sales-agent.module.css"

interface Citation {
  id: string
  title: string
  sourceUrl: string | null
  page: number | null
  clause: string | null
  authority: string
}

interface ChatResponse {
  conversationId: string
  answer: string
  citations: Citation[]
  followUpQuestion: string | null
  handoffSuggested: boolean
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  text: string
  citations?: Citation[]
  followUpQuestion?: string | null
  handoffSuggested?: boolean
  error?: boolean
}

const STARTERS = [
  "What should I know before building?",
  "How should I investigate subdivision?",
  "Which documents can I access?",
]

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Welcome. I can help you explore the land, planning pathway and available due-diligence documents. What matters most to you?",
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function safeCitationHref(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith("/") || url.startsWith("https://") || url.startsWith("http://")) {
    return url
  }
  return null
}

async function responsePayload<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) {
    throw new Error(payload.error || "The request could not be completed.")
  }
  return payload
}

export function SalesAgent() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [handoffOpen, setHandoffOpen] = useState(false)
  const [handoffComplete, setHandoffComplete] = useState(false)
  const [handoffError, setHandoffError] = useState<string | null>(null)
  const [handoffSending, setHandoffSending] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, sending, handoffOpen])

  const buyerHasAsked = messages.some((message) => message.role === "user")
  const modelSuggestedHandoff = messages.some((message) => message.handoffSuggested)

  async function sendMessage(rawMessage: string) {
    const message = rawMessage.trim()
    if (!message || sending) return

    setDraft("")
    setHandoffOpen(false)
    setMessages((current) => [
      ...current,
      { id: makeId(), role: "user", text: message },
    ])
    setSending(true)

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          ...(conversationId ? { conversationId } : {}),
        }),
      })
      const payload = await responsePayload<ChatResponse>(response)
      setConversationId(payload.conversationId)
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          text: payload.answer,
          citations: payload.citations,
          followUpQuestion: payload.followUpQuestion,
          handoffSuggested: payload.handoffSuggested,
        },
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "The guide is temporarily unavailable. Please try again shortly.",
          error: true,
        },
      ])
    } finally {
      setSending(false)
    }
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(draft)
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void sendMessage(draft)
    }
  }

  async function submitHandoff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setHandoffError(null)
    setHandoffSending(true)
    const form = new FormData(event.currentTarget)

    try {
      const response = await fetch("/api/agent/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          name: String(form.get("name") || ""),
          email: String(form.get("email") || ""),
          phone: String(form.get("phone") || "") || null,
          summary: "Buyer requested a private Murrumbella conversation through the website guide.",
          consent: form.get("consent") === "yes",
        }),
      })
      await responsePayload<{ ok: true }>(response)
      setHandoffComplete(true)
    } catch (error) {
      setHandoffError(
        error instanceof Error ? error.message : "Your request could not be saved.",
      )
    } finally {
      setHandoffSending(false)
    }
  }

  return (
    <div className={styles.shell} data-open={open ? "true" : "false"}>
      {open && (
        <section
          className={styles.panel}
          role="dialog"
          aria-modal="false"
          aria-label="Murrumbella Guide"
        >
          <header className={styles.header}>
            <div className={styles.identity}>
              <span className={styles.identityMark} aria-hidden="true">
                M
              </span>
              <div>
                <div className={styles.title}>Murrumbella Guide</div>
                <div className={styles.disclosure}>
                  <span className={styles.statusDot} aria-hidden="true" />
                  AI property guide
                </div>
              </div>
            </div>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setOpen(false)}
              aria-label="Close the Murrumbella Guide"
            >
              <X size={18} strokeWidth={1.7} />
            </button>
          </header>

          <div className={styles.contextBar}>
            Verified property information · Sources shown when used
          </div>

          <div className={styles.conversation} ref={scrollRef} aria-live="polite">
            {messages.map((message, index) => (
              <article
                key={message.id}
                className={`${styles.message} ${
                  message.role === "user" ? styles.userMessage : styles.guideMessage
                } ${message.error ? styles.errorMessage : ""}`}
              >
                {message.role === "assistant" && (
                  <div className={styles.messageLabel}>Guide</div>
                )}
                <p>{message.text}</p>

                {message.citations && message.citations.length > 0 && (
                  <details className={styles.citations}>
                    <summary>
                      {message.citations.length === 1
                        ? "1 source"
                        : `${message.citations.length} sources`}
                    </summary>
                    <ul>
                      {message.citations.map((citation) => {
                        const href = safeCitationHref(citation.sourceUrl)
                        return (
                          <li key={citation.id}>
                            {href ? (
                              <a href={href} target="_blank" rel="noreferrer">
                                <span>{citation.title}</span>
                                <ExternalLink size={12} aria-hidden="true" />
                              </a>
                            ) : (
                              <span>{citation.title}</span>
                            )}
                            {(citation.clause || citation.page) && (
                              <small>
                                {[citation.clause, citation.page ? `page ${citation.page}` : null]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </small>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </details>
                )}

                {message.followUpQuestion && index === messages.length - 1 && (
                  <button
                    type="button"
                    className={styles.followUp}
                    onClick={() => void sendMessage(message.followUpQuestion || "")}
                  >
                    <span>{message.followUpQuestion}</span>
                    <ChevronRight size={14} aria-hidden="true" />
                  </button>
                )}
              </article>
            ))}

            {sending && (
              <div className={styles.thinking} aria-label="The guide is preparing an answer">
                <span />
                <span />
                <span />
              </div>
            )}

            {!buyerHasAsked && !sending && (
              <div className={styles.starters} aria-label="Suggested questions">
                {STARTERS.map((starter) => (
                  <button key={starter} type="button" onClick={() => void sendMessage(starter)}>
                    <span>{starter}</span>
                    <ChevronRight size={14} aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}

            {buyerHasAsked && !handoffOpen && !handoffComplete && !sending && (
              <button
                type="button"
                className={`${styles.handoffPrompt} ${
                  modelSuggestedHandoff ? styles.handoffSuggested : ""
                }`}
                onClick={() => setHandoffOpen(true)}
              >
                <UserRound size={16} strokeWidth={1.6} aria-hidden="true" />
                <span>
                  <strong>Continue with the owner</strong>
                  Request a private conversation
                </span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            )}

            {handoffOpen && !handoffComplete && (
              <form className={styles.handoffForm} onSubmit={submitHandoff}>
                <div className={styles.formHeading}>
                  <div>
                    <span>Private introduction</span>
                    <strong>Continue with Rob</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHandoffOpen(false)}
                    aria-label="Close contact form"
                  >
                    <X size={16} />
                  </button>
                </div>
                <label>
                  <span>Name</span>
                  <input name="name" autoComplete="name" required minLength={2} />
                </label>
                <label>
                  <span>Email</span>
                  <input name="email" type="email" autoComplete="email" required />
                </label>
                <label>
                  <span>Phone <em>optional</em></span>
                  <input name="phone" type="tel" autoComplete="tel" />
                </label>
                <label className={styles.consent}>
                  <input name="consent" type="checkbox" value="yes" required />
                  <span>I consent to being contacted about Murrumbella.</span>
                </label>
                {handoffError && (
                  <p className={styles.formError} role="alert">
                    {handoffError}{" "}
                    <a href="mailto:rob@integratedauto.com.au">Email Rob directly.</a>
                  </p>
                )}
                <button type="submit" className={styles.submitHandoff} disabled={handoffSending}>
                  {handoffSending ? <Loader2 size={16} className={styles.spinner} /> : null}
                  {handoffSending ? "Saving request" : "Request conversation"}
                </button>
              </form>
            )}

            {handoffComplete && (
              <div className={styles.handoffComplete}>
                <span><Check size={18} aria-hidden="true" /></span>
                <div>
                  <strong>Request received</strong>
                  <p>Rob can now follow up with you privately.</p>
                </div>
              </div>
            )}
          </div>

          <form className={styles.composer} onSubmit={submitMessage}>
            <label htmlFor="murrumbella-question" className={styles.srOnly}>
              Ask a question about Murrumbella
            </label>
            <textarea
              ref={inputRef}
              id="murrumbella-question"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Ask about the land, planning or documents…"
              rows={1}
              maxLength={2000}
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              aria-label="Send question"
            >
              <Send size={17} strokeWidth={1.7} />
            </button>
          </form>
          <div className={styles.footnote}>
            Verify important decisions with your own advisers.
          </div>
        </section>
      )}

      <button
        type="button"
        className={styles.launcher}
        aria-label="Ask the Murrumbella Guide"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={22} /> : <MessageCircle size={23} strokeWidth={1.6} />}
        {!open && <span>Ask Murrumbella</span>}
      </button>
    </div>
  )
}

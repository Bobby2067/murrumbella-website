"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { UserButton, useUser } from "@clerk/nextjs"

/* ---- Image sets (curated from /review picks) ---- */
const HERO_SLIDES = ["/photos/IMG_3080.jpg", "/photos/IMG_3248.JPEG", "/photos/IMG_2756.jpg"]
const LAND_SLIDES = ["/photos/IMG_2756.jpg", "/photos/IMG_3204.JPEG", "/photos/IMG_3311.JPEG", "/photos/IMG_4686.JPEG"]
const LAND_THUMBS = ["/photos/IMG_3244.JPEG", "/photos/IMG_3211.JPEG"]
const RIVER_SLIDES = ["/photos/IMG_2869.jpg", "/photos/IMG_3081.JPEG"]

type GalleryItem = { src: string; cap: string; big?: boolean; wide?: boolean }
const GALLERY: GalleryItem[] = [
  { src: "/photos/IMG_2206.jpg", cap: "First light over the valley", big: true },
  { src: "/photos/IMG_3245.JPEG", cap: "Native eucalypt woodland" },
  { src: "/photos/IMG_3251.JPEG", cap: "Along the Murrumbidgee" },
  { src: "/photos/IMG_2205.JPEG", cap: "Morning mist on the land" },
  { src: "/photos/IMG_4683.JPEG", cap: "River red gums" },
  { src: "/photos/IMG_3204.JPEG", cap: "Open country from above", wide: true },
  { src: "/photos/IMG_2201.jpg", cap: "Last light" },
  { src: "/photos/IMG_3213.jpg", cap: "The water's edge" },
  { src: "/photos/IMG_3311.JPEG", cap: "Aerial over the property" },
  { src: "/photos/IMG_3005.JPEG", cap: "Still water" },
  { src: "/photos/IMG_2203.jpg", cap: "Folded hills at dusk" },
  { src: "/photos/IMG_3324.JPEG", cap: "Riverbank habitat" },
  { src: "/photos/IMG_3211.JPEG", cap: "The valley below" },
  { src: "/photos/IMG_4686.JPEG", cap: "Toward the river" },
]

/* ---- Auto-advancing cross-fade carousel ---- */
function Carousel({
  slides,
  position = "center",
  intervalMs = 6000,
}: {
  slides: string[]
  position?: string
  intervalMs?: number
}) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), intervalMs)
    return () => clearInterval(t)
  }, [slides.length, intervalMs])

  return (
    <>
      {slides.map((src, i) => (
        <div
          key={src + i}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('${src}')`,
            backgroundSize: "cover",
            backgroundPosition: position,
            opacity: i === idx ? 1 : 0,
            transform: i === idx ? "scale(1.07)" : "scale(1)",
            transition: "opacity 2s ease, transform 8s ease",
          }}
        />
      ))}
    </>
  )
}

export function EstateLanding() {
  const [scrolled, setScrolled] = useState(false)
  const [lightIdx, setLightIdx] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const revealRoot = useRef<HTMLDivElement>(null)
  const { isSignedIn } = useUser()

  /* nav frosted on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* reveal on scroll */
  useEffect(() => {
    const root = revealRoot.current
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"))
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach((el) => (el.style.opacity = "1"))
      return
    }
    items.forEach((el) => {
      el.style.opacity = "0"
      el.style.transform = "translateY(28px)"
      el.style.transition = "opacity 1s cubic-bezier(.2,.7,.2,1), transform 1s cubic-bezier(.2,.7,.2,1)"
    })
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const el = en.target as HTMLElement
            el.style.opacity = "1"
            el.style.transform = "translateY(0)"
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  /* lightbox keyboard nav */
  useEffect(() => {
    if (lightIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightIdx(null)
      else if (e.key === "ArrowRight") setLightIdx((i) => (i === null ? i : (i + 1) % GALLERY.length))
      else if (e.key === "ArrowLeft") setLightIdx((i) => (i === null ? i : (i - 1 + GALLERY.length) % GALLERY.length))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightIdx])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      message: String(fd.get("message") ?? ""),
      interest: "enquiry",
    }
    setSubmitted(true)
    try {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } catch {
      /* best-effort: the thank-you still shows */
    }
  }

  return (
    <div ref={revealRoot} className="ml-root">
      <style>{ML_CSS}</style>

      {/* NAV */}
      <nav className={`ml-nav${scrolled ? " ml-nav--solid" : ""}`}>
        <a href="#top" className="ml-nav__brand ml-nc">Murrumbella</a>
        <div className="ml-nav__links">
          <a href="#the-land" className="ml-nc ml-navlink">The Land</a>
          <a href="#gallery" className="ml-nc ml-navlink">Gallery</a>
          {!isSignedIn ? (
            <>
              <a href="/sign-in" className="ml-nc ml-authlink">Sign In</a>
              <a href="/register" className="ml-nc ml-nav__cta">Register</a>
            </>
          ) : (
            <>
              <a href="/dossier" className="ml-nc ml-authlink">Dossier</a>
              <span style={{ display: "inline-flex", alignItems: "center" }}>
                <UserButton />
              </span>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section id="top" className="ml-hero">
        <div className="ml-hero__bg">
          <Carousel slides={HERO_SLIDES} position="center 58%" />
        </div>
        <div className="ml-hero__scrim" />
        <div className="ml-hero__inner">
          <p className="ml-eyebrow ml-eyebrow--light">424 Horseshoe Road &nbsp;·&nbsp; Mullion, NSW</p>
          <h1 className="ml-hero__title">Murrumbella</h1>
          <p className="ml-hero__sub">
            164 hectares on the Murrumbidgee.<br />2.5km of river. Forty minutes from Canberra.
          </p>
          <div className="ml-hero__cta">
            <a href="#the-land" className="ml-btn ml-btn--solid">Explore the Land</a>
            <a href="/register" className="ml-btn ml-btn--ghost">Register for the Dossier</a>
          </div>
        </div>
        <div className="ml-stats">
          <div className="ml-stats__inner">
            {[
              ["164.31", "Hectares"],
              ["2.5km", "River Frontage"],
              ["40min", "To Canberra"],
              ["RU1", "Rural Zoning"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="ml-stats__n">{n}</div>
                <div className="ml-stats__l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTRO STATEMENT */}
      <section className="ml-statement">
        <div data-reveal className="ml-statement__inner">
          <p className="ml-eyebrow ml-eyebrow--accent">A once-in-a-generation property</p>
          <p className="ml-statement__text">
            You are not buying a house. You are buying the right to build a legacy — from scratch, on one of the last
            great river properties near Canberra.
          </p>
        </div>
      </section>

      {/* THE LAND */}
      <section id="the-land" className="ml-land">
        <div className="ml-land__inner">
          <div data-reveal className="ml-land__imgcol">
            <div className="ml-land__main">
              <Carousel slides={LAND_SLIDES} />
            </div>
            <div className="ml-land__thumbs">
              {LAND_THUMBS.map((src) => (
                <div key={src} className="ml-land__thumb" style={{ backgroundImage: `url('${src}')` }} />
              ))}
            </div>
          </div>
          <div data-reveal className="ml-land__txt">
            <p className="ml-eyebrow ml-eyebrow--accent">The Land</p>
            <h2 className="ml-h2">Not a listing.<br />A decision.</h2>
            <p className="ml-body">
              164.31 hectares of undeveloped river country — native eucalypt woodland, river red gums, and open pastoral
              grassland folding down to 2.5 kilometres of frontage on the Murrumbidgee. Genuinely rural, genuinely
              scarce, and held under a single title with vision in mind.
            </p>
            <div className="ml-spec">
              <div className="ml-spec__cell ml-spec__cell--r">
                <div className="ml-spec__n">164.31<span className="ml-spec__u"> ha</span></div>
                <div className="ml-spec__l">Total Area</div>
              </div>
              <div className="ml-spec__cell">
                <div className="ml-spec__n">2.5<span className="ml-spec__u"> km</span></div>
                <div className="ml-spec__l">River Frontage</div>
              </div>
              <div className="ml-spec__cell ml-spec__cell--r">
                <div className="ml-spec__n">Dwelling</div>
                <div className="ml-spec__l">Permitted with consent</div>
              </div>
              <div className="ml-spec__cell">
                <div className="ml-spec__n">40<span className="ml-spec__u"> min</span></div>
                <div className="ml-spec__l">To Canberra CBD</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE RIVER */}
      <section className="ml-river">
        <div className="ml-river__bg">
          <Carousel slides={RIVER_SLIDES} position="center 55%" />
        </div>
        <div className="ml-river__scrim" />
        <div data-reveal className="ml-river__inner">
          <p className="ml-eyebrow ml-eyebrow--light">The River</p>
          <p className="ml-river__quote">
            The Murrumbidgee has shaped this valley for thousands of years.<br />Soon it will shape your mornings.
          </p>
        </div>
        <div className="ml-river__strip">
          <div className="ml-river__stripinner">
            <p className="ml-river__striptitle">2.5km of frontage · Riparian water rights · A river to fish</p>
            <div className="ml-river__fish">
              <div>
                <div className="ml-river__fishname">Murray Cod</div>
                <div className="ml-river__fishdesc">The river's great native, holding deep in the quiet runs</div>
              </div>
              <div className="ml-river__fishmid">
                <div className="ml-river__fishname">Golden Perch</div>
                <div className="ml-river__fishdesc">Yellowbelly on the rise through the warmer months</div>
              </div>
              <div>
                <div className="ml-river__fishname">Platypus</div>
                <div className="ml-river__fishdesc">Working the still edges at first and last light</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE OPPORTUNITY */}
      <section className="ml-opp">
        <div data-reveal className="ml-opp__inner">
          <div className="ml-opp__head">
            <p className="ml-eyebrow ml-eyebrow--accent">The Opportunity</p>
            <h2 className="ml-h2">Three ways to hold it</h2>
          </div>
          <div className="ml-opp__grid">
            {[
              ["01", "Build", "At 164 hectares of RU1 land — well above the 40-hectare minimum lot size — a dwelling is a permitted use here, subject to council consent. Design your home from a blank canvas, sited exactly where the land asks for it. (No dwelling has been approved or built; the canvas is yours.)"],
              ["02", "Conserve", "A living wildlife corridor of native woodland, river red gums and birdlife habitat — with real conservation and long-term carbon value to steward and protect."],
              ["03", "Hold", "River frontage this close to a capital city does not come twice. Scarcity near Canberra underwrites the patient, generational case for simply holding the land."],
            ].map(([n, h, p]) => (
              <div key={n} className="ml-opp__card">
                <div className="ml-opp__num">{n}</div>
                <h3 className="ml-opp__title">{h}</h3>
                <p className="ml-opp__text">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="ml-gal">
        <div className="ml-gal__inner">
          <div data-reveal className="ml-gal__head">
            <p className="ml-eyebrow ml-eyebrow--accent">Gallery</p>
            <h2 className="ml-h2 ml-h2--light">The land, as it is</h2>
            <p className="ml-gal__sub">
              Every image is the property itself — river, sky, woodland and open country. No renders. No staging.
            </p>
          </div>
          <div className="ml-gal__grid">
            {GALLERY.map((g, i) => (
              <figure
                key={g.src}
                className={`ml-gal__fig${g.big ? " ml-gal__fig--big" : ""}${g.wide ? " ml-gal__fig--wide" : ""}`}
                onClick={() => setLightIdx(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.src} alt={g.cap} loading="lazy" className="ml-gal__img" />
                <figcaption className="ml-gal__cap">{g.cap}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ENQUIRE */}
      <section id="enquire" className="ml-enq">
        <div className="ml-enq__inner">
          <div data-reveal>
            <p className="ml-eyebrow ml-eyebrow--accent">Begin the conversation</p>
            <h2 className="ml-h2 ml-h2--light">This land is<br />offered privately.</h2>
            <p className="ml-enq__lead">
              Enquiries are handled in strict confidence. Register your interest and we will send the private dossier —
              title, deposited plans and the full planning certificate.
            </p>
            <div className="ml-enq__loc">
              <div className="ml-enq__loclabel">Location</div>
              424 Horseshoe Road, Mullion NSW 2582<br />40 minutes from Canberra CBD
            </div>
          </div>
          <div data-reveal>
            {submitted ? (
              <div className="ml-enq__thanks">
                <div className="ml-enq__thankstitle">Thank you.</div>
                <p className="ml-enq__thankstext">
                  Your enquiry has been received in confidence. We will be in touch shortly with the private dossier.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="ml-form">
                <label className="ml-field">
                  <span className="ml-field__label">Name</span>
                  <input name="name" autoComplete="name" required className="ml-input" />
                </label>
                <label className="ml-field">
                  <span className="ml-field__label">Email</span>
                  <input name="email" type="email" autoComplete="email" required className="ml-input" />
                </label>
                <label className="ml-field">
                  <span className="ml-field__label">Phone</span>
                  <input name="phone" type="tel" autoComplete="tel" className="ml-input" />
                </label>
                <label className="ml-field">
                  <span className="ml-field__label">Message</span>
                  <textarea name="message" rows={3} className="ml-input ml-textarea" />
                </label>
                <button type="submit" className="ml-submit">Request Private Dossier</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ml-footer">
        <div className="ml-footer__inner">
          <div className="ml-footer__brand">Murrumbella</div>
          <div className="ml-footer__meta">
            164 hectares · 2.5km of river · a life reimagined<br />
            Offered privately · Enquiries handled in strict confidence
          </div>
        </div>
      </footer>

      {/* LIGHTBOX */}
      {lightIdx !== null && (
        <div className="ml-light" onClick={() => setLightIdx(null)}>
          <button className="ml-light__close" aria-label="Close" onClick={() => setLightIdx(null)}>×</button>
          <button
            className="ml-light__nav ml-light__prev"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation()
              setLightIdx((i) => (i === null ? i : (i - 1 + GALLERY.length) % GALLERY.length))
            }}
          >‹</button>
          <button
            className="ml-light__nav ml-light__next"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation()
              setLightIdx((i) => (i === null ? i : (i + 1) % GALLERY.length))
            }}
          >›</button>
          <div className="ml-light__stage" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GALLERY[lightIdx].src} alt={GALLERY[lightIdx].cap} className="ml-light__img" />
            <div className="ml-light__meta">
              <span>{GALLERY[lightIdx].cap}</span>
              <span className="ml-light__count">{lightIdx + 1} / {GALLERY.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ML_CSS = `
.ml-root{--accent:#C4A882;--cream:#FAFAF8;--sand:#F5F0E8;--char:#1C1C1A;--sage:#8A9E8C;font-family:var(--font-dmsans),sans-serif;color:var(--char);background:var(--cream);overflow-x:hidden;position:relative}
.ml-root *{box-sizing:border-box}
.ml-serif{font-family:var(--font-cormorant),serif}

.ml-eyebrow{font-size:12px;letter-spacing:0.3em;text-transform:uppercase}
.ml-eyebrow--accent{color:var(--accent)}
.ml-eyebrow--light{color:rgba(250,250,248,0.82)}
.ml-h2{font-family:var(--font-cormorant),serif;font-weight:500;font-size:clamp(34px,4.6vw,62px);line-height:1.05;letter-spacing:-0.01em}
.ml-h2--light{color:var(--cream)}
.ml-body{font-size:clamp(15px,1.2vw,18px);line-height:1.75;color:#4a4a44}

/* NAV */
.ml-nav{position:fixed;top:0;left:0;right:0;z-index:60;display:flex;align-items:center;justify-content:space-between;padding:22px clamp(20px,4vw,56px);background:transparent;border-bottom:1px solid transparent;transition:background .5s ease,border-color .5s ease,backdrop-filter .5s ease}
.ml-nav--solid{background:rgba(250,250,248,0.9);backdrop-filter:saturate(180%) blur(14px);-webkit-backdrop-filter:saturate(180%) blur(14px);border-bottom:1px solid rgba(28,28,26,0.08)}
.ml-nav__brand{text-decoration:none;font-weight:500;font-size:15px;letter-spacing:0.34em;text-transform:uppercase}
.ml-nav__links{display:flex;align-items:center;gap:clamp(18px,3vw,40px)}
.ml-navlink{text-decoration:none;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:.85}
.ml-authlink{text-decoration:none;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:.85}
.ml-nav__cta{text-decoration:none;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;padding:11px 20px;border:1px solid currentColor;border-radius:1px;white-space:nowrap;transition:background .3s ease}
.ml-nav__cta:hover{background:rgba(255,255,255,0.12)}
.ml-nc{color:#FAFAF8;transition:color .5s ease}
.ml-nav--solid .ml-nc{color:#1C1C1A}

/* HERO */
.ml-hero{position:relative;height:100vh;min-height:640px;overflow:hidden}
.ml-hero__bg{position:absolute;inset:0;background:#1C1C1A}
.ml-hero__scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,20,18,0.5) 0%,rgba(20,20,18,0.15) 32%,rgba(20,20,18,0.34) 60%,rgba(20,20,18,0.8) 100%)}
.ml-hero__inner{position:relative;z-index:10;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 24px}
.ml-hero__title{font-family:var(--font-cormorant),serif;font-weight:500;color:#FAFAF8;font-size:clamp(64px,13vw,184px);line-height:0.92;letter-spacing:-0.02em;margin:30px 0 26px}
.ml-hero__sub{color:rgba(250,250,248,0.92);font-size:clamp(16px,2vw,21px);font-weight:300;line-height:1.6;max-width:560px;margin-bottom:42px}
.ml-hero__cta{display:flex;flex-wrap:wrap;gap:16px;justify-content:center}
.ml-btn{padding:16px 34px;text-decoration:none;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;border-radius:1px;transition:transform .3s ease,background .3s ease}
.ml-btn--solid{background:#FAFAF8;color:#1C1C1A}
.ml-btn--solid:hover{background:#fff;transform:translateY(-2px)}
.ml-btn--ghost{background:transparent;color:#FAFAF8;border:1px solid rgba(250,250,248,0.55)}
.ml-btn--ghost:hover{background:rgba(255,255,255,0.12)}
.ml-stats{position:absolute;bottom:0;left:0;right:0;z-index:10;background:linear-gradient(180deg,rgba(20,20,18,0) 0%,rgba(20,20,18,0.42) 100%);border-top:1px solid rgba(250,250,248,0.14)}
.ml-stats__inner{max-width:1180px;margin:0 auto;padding:26px clamp(20px,4vw,56px);display:grid;grid-template-columns:repeat(4,1fr);gap:18px;text-align:center}
.ml-stats__n{font-family:var(--font-cormorant),serif;font-size:clamp(26px,3.2vw,40px);color:#FAFAF8;line-height:1}
.ml-stats__l{font-size:10.5px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(250,250,248,0.6);margin-top:8px}

/* STATEMENT */
.ml-statement{background:var(--cream);padding:clamp(90px,13vh,170px) 24px}
.ml-statement__inner{max-width:880px;margin:0 auto;text-align:center}
.ml-statement__text{font-family:var(--font-cormorant),serif;font-weight:400;font-size:clamp(28px,4vw,52px);line-height:1.32;letter-spacing:-0.01em;color:#1C1C1A;margin-top:34px;text-wrap:pretty}

/* LAND */
.ml-land{background:var(--sand);padding:clamp(80px,12vh,150px) clamp(20px,4vw,56px)}
.ml-land__inner{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,4vw,64px);align-items:center}
.ml-land__imgcol{min-width:0}
.ml-land__main{position:relative;aspect-ratio:4/5;border-radius:2px;overflow:hidden;background:#ddd}
.ml-land__thumbs{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
.ml-land__thumb{aspect-ratio:4/3;border-radius:2px;background-size:cover;background-position:center;background-color:#ddd}
.ml-land__txt{min-width:0}
.ml-land__txt .ml-h2{margin:24px 0 28px}
.ml-land__txt .ml-body{max-width:520px;margin-bottom:38px}
.ml-spec{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid rgba(28,28,26,0.12)}
.ml-spec__cell{padding:20px 0 20px 24px;border-bottom:1px solid rgba(28,28,26,0.12)}
.ml-spec__cell--r{padding-left:0;border-right:1px solid rgba(28,28,26,0.12)}
.ml-spec__n{font-family:var(--font-cormorant),serif;font-size:30px;line-height:1}
.ml-spec__u{font-size:16px;color:var(--sage)}
.ml-spec__l{font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:var(--sage);margin-top:8px}

/* RIVER */
.ml-river{position:relative;height:clamp(560px,90vh,900px);overflow:hidden;display:flex;align-items:center;justify-content:center;background:#1C1C1A}
.ml-river__bg{position:absolute;inset:0}
.ml-river__scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,20,18,0.5) 0%,rgba(20,20,18,0.28) 45%,rgba(20,20,18,0.62) 100%)}
.ml-river__inner{position:relative;z-index:5;text-align:center;max-width:780px;padding:0 28px}
.ml-river__quote{font-family:var(--font-cormorant),serif;font-weight:400;font-size:clamp(28px,4.2vw,56px);line-height:1.3;color:#FAFAF8;letter-spacing:-0.01em;margin-top:30px;text-wrap:pretty}
.ml-river__strip{position:absolute;bottom:0;left:0;right:0;z-index:6;background:linear-gradient(180deg,rgba(20,20,18,0) 0%,rgba(20,20,18,0.5) 100%);border-top:1px solid rgba(250,250,248,0.14)}
.ml-river__stripinner{max-width:1180px;margin:0 auto;padding:30px clamp(20px,4vw,56px)}
.ml-river__striptitle{text-align:center;color:rgba(250,250,248,0.6);font-size:11px;letter-spacing:0.26em;text-transform:uppercase;margin-bottom:24px}
.ml-river__fish{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;text-align:center}
.ml-river__fishmid{border-left:1px solid rgba(250,250,248,0.14);border-right:1px solid rgba(250,250,248,0.14)}
.ml-river__fishname{font-family:var(--font-cormorant),serif;font-size:clamp(22px,2.4vw,30px);color:#FAFAF8;margin-bottom:8px}
.ml-river__fishdesc{font-size:12.5px;line-height:1.6;color:rgba(250,250,248,0.58);padding:0 8px}

/* OPPORTUNITY */
.ml-opp{background:var(--cream);padding:clamp(80px,12vh,150px) clamp(20px,4vw,56px)}
.ml-opp__inner{max-width:1240px;margin:0 auto}
.ml-opp__head{text-align:center;margin-bottom:clamp(48px,7vh,90px)}
.ml-opp__head .ml-h2{margin-top:22px}
.ml-opp__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(28px,4vw,64px)}
.ml-opp__card{border-top:1px solid rgba(28,28,26,0.16);padding-top:28px}
.ml-opp__num{font-family:var(--font-cormorant),serif;font-size:20px;color:var(--accent);margin-bottom:18px}
.ml-opp__title{font-family:var(--font-cormorant),serif;font-weight:500;font-size:clamp(26px,2.4vw,34px);margin-bottom:16px}
.ml-opp__text{font-size:15px;line-height:1.75;color:#4a4a44}

/* GALLERY */
.ml-gal{background:#1C1C1A;padding:clamp(80px,12vh,150px) clamp(20px,4vw,56px)}
.ml-gal__inner{max-width:1300px;margin:0 auto}
.ml-gal__head{margin-bottom:clamp(40px,6vh,72px);max-width:640px}
.ml-gal__head .ml-h2{margin:22px 0 18px}
.ml-gal__sub{font-size:15px;line-height:1.7;color:rgba(250,250,248,0.55)}
.ml-gal__grid{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:clamp(150px,15vw,230px);gap:14px}
.ml-gal__fig{position:relative;margin:0;overflow:hidden;border-radius:2px;cursor:pointer;background:#2a2a27}
.ml-gal__fig--big{grid-column:span 2;grid-row:span 2}
.ml-gal__fig--wide{grid-column:span 2}
.ml-gal__img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .9s cubic-bezier(.2,.7,.2,1)}
.ml-gal__fig:hover .ml-gal__img{transform:scale(1.07)}
.ml-gal__cap{position:absolute;left:0;right:0;bottom:0;padding:34px 16px 14px;background:linear-gradient(transparent,rgba(20,20,18,0.78));color:#FAFAF8;font-size:11.5px;letter-spacing:0.12em;text-transform:uppercase;opacity:0;transition:opacity .4s ease}
.ml-gal__fig:hover .ml-gal__cap{opacity:1}

/* ENQUIRE */
.ml-enq{background:#1C1C1A;border-top:1px solid rgba(250,250,248,0.08);padding:clamp(80px,12vh,160px) clamp(20px,4vw,56px)}
.ml-enq__inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,6vw,90px);align-items:start}
.ml-enq__inner .ml-h2{margin:24px 0}
.ml-enq__lead{font-size:16px;line-height:1.75;color:rgba(250,250,248,0.62);max-width:420px;margin-bottom:40px}
.ml-enq__loc{font-size:13px;line-height:2;color:rgba(250,250,248,0.5);letter-spacing:0.04em}
.ml-enq__loclabel{text-transform:uppercase;letter-spacing:0.18em;font-size:11px;color:var(--accent);margin-bottom:6px}
.ml-enq__thanks{padding:48px 0}
.ml-enq__thankstitle{font-family:var(--font-cormorant),serif;font-size:34px;color:#FAFAF8;margin-bottom:16px}
.ml-enq__thankstext{font-size:15px;line-height:1.7;color:rgba(250,250,248,0.6)}
.ml-form{display:flex;flex-direction:column;gap:26px}
.ml-field{display:block}
.ml-field__label{display:block;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(250,250,248,0.45);margin-bottom:10px}
.ml-input{width:100%;background:transparent;border:none;border-bottom:1px solid rgba(250,250,248,0.2);color:#FAFAF8;font-size:16px;padding:8px 0;font-family:var(--font-dmsans),sans-serif;transition:border-color .3s ease}
.ml-input:focus{outline:none;border-color:var(--accent)}
.ml-textarea{resize:none}
.ml-submit{margin-top:8px;align-self:flex-start;padding:16px 38px;background:var(--accent);color:#1C1C1A;border:none;font-family:var(--font-dmsans),sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;cursor:pointer;border-radius:1px;transition:transform .3s ease,filter .3s ease}
.ml-submit:hover{transform:translateY(-2px);filter:brightness(1.06)}

/* FOOTER */
.ml-footer{background:#161614;padding:clamp(48px,8vh,80px) clamp(20px,4vw,56px)}
.ml-footer__inner{max-width:1240px;margin:0 auto;display:flex;flex-wrap:wrap;gap:24px;align-items:center;justify-content:space-between}
.ml-footer__brand{font-weight:500;font-size:15px;letter-spacing:0.34em;text-transform:uppercase;color:#FAFAF8}
.ml-footer__meta{font-size:11.5px;letter-spacing:0.06em;color:rgba(250,250,248,0.4);text-align:right;line-height:1.9}

/* LIGHTBOX */
.ml-light{position:fixed;inset:0;z-index:100;background:rgba(16,16,14,0.96);display:flex;align-items:center;justify-content:center}
.ml-light__close{position:absolute;top:24px;right:28px;background:transparent;border:none;color:rgba(250,250,248,0.7);font-size:30px;line-height:1;cursor:pointer;font-family:serif}
.ml-light__nav{position:absolute;background:transparent;border:none;color:rgba(250,250,248,0.7);font-size:34px;cursor:pointer;padding:14px}
.ml-light__prev{left:clamp(12px,3vw,40px)}
.ml-light__next{right:clamp(12px,3vw,40px)}
.ml-light__stage{max-width:min(1100px,86vw);max-height:84vh;text-align:center}
.ml-light__img{max-width:100%;max-height:78vh;object-fit:contain;border-radius:2px}
.ml-light__meta{margin-top:16px;display:flex;align-items:center;justify-content:center;gap:18px;color:rgba(250,250,248,0.6);font-size:12px;letter-spacing:0.12em;text-transform:uppercase}
.ml-light__count{color:rgba(250,250,248,0.3)}

/* RESPONSIVE */
@media (max-width:860px){
  .ml-land__inner{grid-template-columns:1fr}
  .ml-opp__grid{grid-template-columns:1fr}
  .ml-enq__inner{grid-template-columns:1fr}
  .ml-gal__grid{grid-template-columns:repeat(2,1fr)}
  .ml-nav__links{gap:16px}
  .ml-navlink{display:none}
}
@media (max-width:520px){
  .ml-stats__inner{grid-template-columns:repeat(2,1fr);gap:22px 18px}
  .ml-river__fish{grid-template-columns:1fr;gap:18px}
  .ml-river__fishmid{border:none;padding:18px 0;border-top:1px solid rgba(250,250,248,0.14);border-bottom:1px solid rgba(250,250,248,0.14)}
  .ml-footer__inner{flex-direction:column;align-items:flex-start}
  .ml-footer__meta{text-align:left}
}
`

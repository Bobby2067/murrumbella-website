import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { DOSSIER_DOCS, type DossierDoc, type Tier } from "@/lib/tiers"
import { ensureRegistration } from "@/lib/db"

export const metadata = { title: "Private Dossier — Murrumbella" }
export const dynamic = "force-dynamic"

function groupByCategory(docs: DossierDoc[]) {
  const map = new Map<string, DossierDoc[]>()
  for (const d of docs) {
    if (!map.has(d.category)) map.set(d.category, [])
    map.get(d.category)!.push(d)
  }
  return Array.from(map.entries())
}

export default async function DossierPage() {
  const { userId } = await auth()
  if (!userId) redirect("/register")

  const user = await currentUser()
  const tier = ((user?.publicMetadata?.access_tier as Tier) ?? "registered") as Tier
  const isQualified = tier === "qualified"
  const email = user?.primaryEmailAddress?.emailAddress ?? ""
  const name = user?.fullName ?? user?.firstName ?? ""

  // Best-effort: record this registered user once.
  await ensureRegistration({ clerkUserId: userId, name: name || null, email: email || "unknown" })

  const grouped = groupByCategory(DOSSIER_DOCS)

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", color: "#1C1C1A", fontFamily: "var(--font-dmsans), sans-serif" }}>
      {/* Header */}
      <header
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px clamp(20px,4vw,56px)", borderBottom: "1px solid rgba(28,28,26,0.1)",
          background: "#1C1C1A",
        }}
      >
        <a href="/" style={{ color: "#FAFAF8", textDecoration: "none", fontWeight: 500, fontSize: 15, letterSpacing: "0.34em", textTransform: "uppercase" }}>
          Murrumbella
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <a href="/" style={{ color: "rgba(250,250,248,0.8)", textDecoration: "none", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase" }}>Home</a>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Intro */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(40px,7vh,80px) clamp(20px,4vw,56px) 0" }}>
        <p style={{ color: "#C4A882", fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 18 }}>Private Dossier</p>
        <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 500, fontSize: "clamp(34px,5vw,58px)", lineHeight: 1.05, marginBottom: 16 }}>
          424 Horseshoe Road, Mullion
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "#4a4a44", maxWidth: 620 }}>
          Welcome{name ? `, ${name}` : ""}. You have <strong>{isQualified ? "Qualified" : "Registered"}</strong> access.
          {isQualified
            ? " The full data room — title, plans, easements and the approved dwelling consent — is available below."
            : " Below are the property's planning and mapping documents. Title, deposited plans and the approved dwelling consent are released to qualified buyers — request access at the bottom of this page."}
        </p>
      </section>

      {/* Document groups */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(32px,5vh,56px) clamp(20px,4vw,56px) 60px" }}>
        {grouped.map(([category, docs]) => (
          <div key={category} style={{ marginBottom: 44 }}>
            <h2 style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 500, fontSize: 24, marginBottom: 18, borderBottom: "1px solid rgba(28,28,26,0.12)", paddingBottom: 10 }}>
              {category}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {docs.map((doc) => {
                const locked = doc.tier === "qualified" && !isQualified
                return (
                  <div
                    key={doc.key}
                    style={{
                      border: "1px solid rgba(28,28,26,0.12)", borderRadius: 4, padding: "18px 20px",
                      background: locked ? "rgba(28,28,26,0.03)" : "#fff", opacity: locked ? 0.7 : 1,
                      display: "flex", flexDirection: "column", gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
                      <div style={{ fontWeight: 500, fontSize: 15 }}>{doc.label}</div>
                      {locked && (
                        <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4A882", whiteSpace: "nowrap" }}>
                          Qualified
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: "#6a6a64" }}>{doc.description}</div>
                    {locked ? (
                      <span style={{ fontSize: 12, color: "#9a9a92", marginTop: 4 }}>🔒 Requires qualified access</span>
                    ) : (
                      <a
                        href={`/api/document/${doc.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1C1C1A", fontWeight: 500, marginTop: 4 }}
                      >
                        View document →
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {!isQualified && (
          <div style={{ marginTop: 24, padding: "28px 32px", background: "#1C1C1A", borderRadius: 6, color: "#FAFAF8" }}>
            <h3 style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 500, fontSize: 26, marginBottom: 10 }}>
              Request qualified access
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(250,250,248,0.7)", maxWidth: 560, marginBottom: 18 }}>
              The full legal and title pack is released to genuinely interested buyers. Reply to your
              welcome email, or contact the owner directly, and your access will be upgraded.
            </p>
            <a
              href="mailto:rob@integratedauto.com.au?subject=Murrumbella%20—%20Qualified%20access%20request"
              style={{ display: "inline-block", padding: "14px 30px", background: "#C4A882", color: "#1C1C1A", textDecoration: "none", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", borderRadius: 2, fontWeight: 500 }}
            >
              Request access
            </a>
          </div>
        )}
      </section>
    </div>
  )
}

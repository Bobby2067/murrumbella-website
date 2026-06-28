import { SignUp } from "@clerk/nextjs"

export const metadata = { title: "Register — Murrumbella" }

export default function RegisterPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1C1C1A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px",
        gap: "28px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 460 }}>
        <a
          href="/"
          style={{
            color: "#FAFAF8",
            textDecoration: "none",
            fontFamily: "var(--font-dmsans), sans-serif",
            fontWeight: 500,
            fontSize: 15,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
          }}
        >
          Murrumbella
        </a>
        <p
          style={{
            color: "rgba(250,250,248,0.6)",
            fontFamily: "var(--font-dmsans), sans-serif",
            fontSize: 14,
            lineHeight: 1.6,
            marginTop: 18,
          }}
        >
          Register to access the private dossier — the planning certificate, maps and full
          gallery. Title, deposited plans and easement instruments are released to qualified buyers.
        </p>
      </div>
      <SignUp
        signInUrl="/sign-in"
        forceRedirectUrl="/dossier"
        appearance={{ variables: { colorPrimary: "#C4A882" } }}
      />
    </div>
  )
}

import { SignIn } from "@clerk/nextjs"

export const metadata = { title: "Sign in — Murrumbella" }

export default function SignInPage() {
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
      <SignIn
        signUpUrl="/register"
        forceRedirectUrl="/dossier"
        appearance={{ variables: { colorPrimary: "#C4A882" } }}
      />
    </div>
  )
}

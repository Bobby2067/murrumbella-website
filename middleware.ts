import { clerkMiddleware } from "@clerk/nextjs/server"

// Run Clerk on these routes so auth() works in the page/route. We do NOT call
// auth.protect() here — the /dossier page redirects unauthenticated users to
// /register itself, and /api/document returns 401/403. This gives clean UX
// (a real login redirect, not a bare 404) and keeps the homepage untouched.
export default clerkMiddleware()

// Scope the middleware to ONLY the protected routes. The homepage, register
// and sign-in pages get Clerk via <ClerkProvider> (client-side) and never
// invoke the secret-key-dependent middleware — so they can't be taken down
// by a runtime auth/env issue.
export const config = {
  matcher: ["/dossier/:path*", "/api/document/:path*"],
}

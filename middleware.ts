import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server"

import { clerkMiddlewareEnabled } from "@/lib/auth/middleware-mode"

// Run Clerk on these routes so auth() works in the page/route. We do NOT call
// auth.protect() here — the /dossier page redirects unauthenticated users to
// /register itself, and /api/document returns 401/403. This gives clean UX
// (a real login redirect, not a bare 404) and keeps the homepage untouched.
const authenticatedMiddleware = clerkMiddleware()

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  // Public browsing and the public guide must still work in an unconfigured
  // local/preview environment. Production enables Clerk as soon as the
  // server-side secret is present.
  if (!clerkMiddlewareEnabled()) return NextResponse.next()
  return authenticatedMiddleware(request, event)
}

// Scope the middleware to ONLY the protected routes. The homepage, register
// and sign-in pages get Clerk via <ClerkProvider> (client-side) and never
// invoke the secret-key-dependent middleware — so they can't be taken down
// by a runtime auth/env issue.
export const config = {
  matcher: [
    "/dossier/:path*",
    "/api/document/:path*",
    "/api/agent/:path*",
    "/review/:path*",
    "/review",
  ],
}

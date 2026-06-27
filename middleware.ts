import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Only these require a signed-in user.
const isProtected = createRouteMatcher(["/dossier(.*)", "/api/document(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    await auth.protect()
  }
})

// Scope the middleware to ONLY the protected routes. The homepage, register
// and sign-in pages get Clerk via <ClerkProvider> (client-side) and never
// invoke the secret-key-dependent middleware — so they can't be taken down
// by a runtime auth/env issue.
export const config = {
  matcher: ["/dossier/:path*", "/api/document/:path*"],
}

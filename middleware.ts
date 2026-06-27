import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Only these require a signed-in user. Everything else (homepage, register,
// sign-in, static assets) stays public.
const isProtected = createRouteMatcher(["/dossier(.*)", "/api/document(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Run on everything except Next internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|webp|ico|woff2?|ttf|pdf)).*)",
    // Always run on API routes
    "/(api|trpc)(.*)",
  ],
}

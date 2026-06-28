export function clerkMiddlewareEnabled(
  secretKey: string | undefined = process.env.CLERK_SECRET_KEY,
): boolean {
  return Boolean(secretKey?.trim())
}

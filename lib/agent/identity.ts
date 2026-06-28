import { auth, currentUser } from "@clerk/nextjs/server"

import type { AccessTier, ConversationIdentity } from "./types"

export function tierFromMetadata(value: unknown): Exclude<AccessTier, "public"> {
  return value === "qualified" ? "qualified" : "registered"
}

export async function resolveConversationIdentity(): Promise<ConversationIdentity> {
  try {
    const { userId } = await auth()
    if (!userId) return { clerkUserId: null, accessTier: "public" }

    const user = await currentUser()
    return {
      clerkUserId: userId,
      accessTier: tierFromMetadata(user?.publicMetadata?.access_tier),
    }
  } catch (error) {
    console.error("Clerk identity resolution failed; using public access:", error)
    return { clerkUserId: null, accessTier: "public" }
  }
}

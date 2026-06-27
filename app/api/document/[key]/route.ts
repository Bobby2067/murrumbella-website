import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { DOSSIER_DOCS } from "@/lib/tiers"
import { logDocumentAccess } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const doc = DOSSIER_DOCS.find((d) => d.key === key)
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  const user = await currentUser()
  const tier = (user?.publicMetadata?.access_tier as string) ?? "registered"

  if (doc.tier === "qualified" && tier !== "qualified") {
    return NextResponse.json(
      { error: "This document requires qualified access. Contact the owner to be approved." },
      { status: 403 },
    )
  }

  const filePath = path.join(process.cwd(), "protected-docs", doc.file)
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 })
  }

  const data = fs.readFileSync(filePath)

  await logDocumentAccess({
    clerkUserId: userId,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    documentKey: key,
  })

  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": doc.mime,
      "Content-Disposition": `inline; filename="${doc.file}"`,
      "Cache-Control": "private, no-store",
    },
  })
}

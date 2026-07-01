import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const OWNER = "bobby2067"
const REPO = "murrumbella-website"
const BRANCH = "main"
const DIR = "public/photos"

type IncomingFile = { name: string; contentBase64: string }

export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN
  const secret = process.env.UPLOAD_SECRET

  if (!token) {
    return NextResponse.json(
      { error: "Server not configured: missing GITHUB_TOKEN env var." },
      { status: 500 },
    )
  }

  let body: { secret?: string; files?: IncomingFile[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (!secret || body.secret !== secret) {
    return NextResponse.json({ error: "Invalid passcode." }, { status: 401 })
  }

  const files = body.files ?? []
  if (!files.length) {
    return NextResponse.json({ error: "No files provided." }, { status: 400 })
  }
  if (files.length > 40) {
    return NextResponse.json({ error: "Max 40 files per upload. Try a smaller batch." }, { status: 400 })
  }

  const gh = async (path: string, init: RequestInit = {}) => {
    const r = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "murrumbella-uploader",
        ...(init.headers || {}),
      },
    })
    if (!r.ok) {
      throw new Error(`GitHub ${path} -> ${r.status}: ${await r.text()}`)
    }
    return r.json()
  }

  try {
    const ref = await gh(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`)
    const latestSha = ref.object.sha
    const latestCommit = await gh(`/repos/${OWNER}/${REPO}/git/commits/${latestSha}`)
    const baseTree = latestCommit.tree.sha

    const treeItems: { path: string; mode: "100644"; type: "blob"; sha: string }[] = []
    const committed: string[] = []

    for (const f of files) {
      const blob = await gh(`/repos/${OWNER}/${REPO}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: f.contentBase64, encoding: "base64" }),
      })
      const safe = (f.name || "upload.jpg").replace(/[^a-zA-Z0-9._-]/g, "_")
      const filePath = `${DIR}/${safe}`
      treeItems.push({ path: filePath, mode: "100644", type: "blob", sha: blob.sha })
      committed.push(safe)
    }

    const newTree = await gh(`/repos/${OWNER}/${REPO}/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: baseTree, tree: treeItems }),
    })

    const newCommit = await gh(`/repos/${OWNER}/${REPO}/git/commits`, {
      method: "POST",
      body: JSON.stringify({
        message: `Upload ${files.length} photo(s) via /review`,
        tree: newTree.sha,
        parents: [latestSha],
      }),
    })

    await gh(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: newCommit.sha }),
    })

    return NextResponse.json({ ok: true, count: committed.length, committed })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Upload failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

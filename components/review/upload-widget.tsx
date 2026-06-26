"use client"

import { useState } from "react"

type Status = "idle" | "processing" | "uploading" | "done" | "error"

async function downscaleToBase64(file: File, maxDim = 2000, quality = 0.82): Promise<string> {
  const dataUrl: string = await new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })

  const img: HTMLImageElement = await new Promise((res, rej) => {
    const im = new Image()
    im.onload = () => res(im)
    im.onerror = rej
    im.src = dataUrl
  })

  let { width, height } = img
  if (width > maxDim || height > maxDim) {
    const scale = Math.min(maxDim / width, maxDim / height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported")
  ctx.drawImage(img, 0, 0, width, height)

  const base64: string = await new Promise((res, rej) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return rej(new Error("Encode failed"))
        const r = new FileReader()
        r.onload = () => res((r.result as string).split(",")[1])
        r.onerror = rej
        r.readAsDataURL(blob)
      },
      "image/jpeg",
      quality,
    )
  })

  return base64
}

function makeName(original: string): string {
  const base = original.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 40)
  const stamp = Date.now().toString(36)
  return `up_${stamp}_${base}.jpg`
}

export function UploadWidget() {
  const [secret, setSecret] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<Status>("idle")
  const [progress, setProgress] = useState("")
  const [message, setMessage] = useState("")

  const onUpload = async () => {
    if (!files.length) {
      setMessage("Choose some photos first.")
      return
    }
    setStatus("processing")
    setMessage("")
    try {
      const payload: { name: string; contentBase64: string }[] = []
      for (let i = 0; i < files.length; i++) {
        setProgress(`Downscaling ${i + 1} / ${files.length}…`)
        const contentBase64 = await downscaleToBase64(files[i])
        payload.push({ name: makeName(files[i].name), contentBase64 })
      }

      setStatus("uploading")
      setProgress(`Uploading ${payload.length} photo(s)…`)
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, files: payload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")

      setStatus("done")
      setProgress("")
      setMessage(`✅ Uploaded ${data.count} photo(s). The site is rebuilding — they'll appear here in ~2–3 min. Refresh then.`)
      setFiles([])
    } catch (e: unknown) {
      setStatus("error")
      setProgress("")
      setMessage(`❌ ${e instanceof Error ? e.message : "Upload failed"}`)
    }
  }

  const busy = status === "processing" || status === "uploading"

  return (
    <div style={{
      background: "#1b1b1b", border: "1px solid #333", borderRadius: "8px",
      padding: "1rem", marginBottom: "2rem", maxWidth: "640px",
    }}>
      <div style={{ color: "#fff", fontSize: "0.95rem", fontWeight: "bold", marginBottom: "0.75rem" }}>
        Upload photos
      </div>

      <input
        type="password"
        placeholder="Passcode"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        style={{
          width: "100%", padding: "8px", marginBottom: "8px",
          background: "#111", color: "#fff", border: "1px solid #444", borderRadius: "4px",
        }}
      />

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        style={{ color: "#ccc", fontSize: "0.85rem", marginBottom: "8px", display: "block" }}
      />

      {files.length > 0 && (
        <div style={{ color: "#8a9e8c", fontSize: "0.8rem", marginBottom: "8px" }}>
          {files.length} file(s) selected — will be downscaled to max 2000px before upload.
        </div>
      )}

      <button
        onClick={onUpload}
        disabled={busy}
        style={{
          background: busy ? "#555" : "#c4a882", color: "#1c1c1a",
          border: "none", borderRadius: "4px", padding: "8px 16px",
          fontWeight: "bold", cursor: busy ? "default" : "pointer",
        }}
      >
        {busy ? "Working…" : "Downscale & Upload"}
      </button>

      {progress && <div style={{ color: "#aaa", fontSize: "0.8rem", marginTop: "8px" }}>{progress}</div>}
      {message && <div style={{ color: "#ddd", fontSize: "0.85rem", marginTop: "8px" }}>{message}</div>}
    </div>
  )
}

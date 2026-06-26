import fs from "fs"
import path from "path"
import { UploadWidget } from "@/components/review/upload-widget"

export const dynamic = "force-dynamic"

function getPhotos(): string[] {
  const dir = path.join(process.cwd(), "public", "photos")
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
      .sort()
  } catch {
    return []
  }
}

export default function ReviewPage() {
  const photos = getPhotos()

  return (
    <div style={{ background: "#111", minHeight: "100vh", padding: "2rem", fontFamily: "monospace" }}>
      <h1 style={{ color: "#fff", marginBottom: "0.5rem", fontSize: "1.5rem" }}>
        Photo Review — {photos.length} images
      </h1>
      <p style={{ color: "#888", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
        Upload below (auto-downscaled), or browse the current set. Click any photo for full size.
      </p>

      <UploadWidget />

      {photos.length === 0 ? (
        <p style={{ color: "#f66" }}>No photos found in /public/photos.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
          {photos.map((filename, i) => (
            <a
              key={filename}
              href={`/photos/${filename}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", textDecoration: "none" }}
            >
              <div style={{ position: "relative", paddingBottom: "75%", background: "#222", borderRadius: "6px", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/photos/${filename}`}
                  alt={filename}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
                <div style={{
                  position: "absolute", top: "6px", left: "6px",
                  background: "rgba(0,0,0,0.7)", color: "#fff",
                  fontSize: "11px", padding: "2px 6px", borderRadius: "3px", fontWeight: "bold"
                }}>
                  #{i + 1}
                </div>
              </div>
              <p style={{ color: "#aaa", fontSize: "10px", marginTop: "4px", wordBreak: "break-all" }}>{filename}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

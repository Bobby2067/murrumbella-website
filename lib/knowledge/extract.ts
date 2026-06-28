export interface ExtractedPage {
  page: number | null
  text: string
}

export class DocumentExtractionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DocumentExtractionError"
  }
}

export function normaliseExtractedText(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function assertText(pages: ExtractedPage[]): ExtractedPage[] {
  const useful = pages
    .map((page) => ({ ...page, text: normaliseExtractedText(page.text) }))
    .filter((page) => page.text.length > 0)
  if (useful.length === 0) {
    throw new DocumentExtractionError(
      "Document has no extractable text; OCR or manual review is required.",
    )
  }
  return useful
}

function decodeHtmlEntities(value: string): string {
  const entities: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
  }
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const hexadecimal = entity[1]?.toLowerCase() === "x"
      const valuePart = hexadecimal ? entity.slice(2) : entity.slice(1)
      const codePoint = Number.parseInt(valuePart, hexadecimal ? 16 : 10)
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match
    }
    return entities[entity.toLowerCase()] ?? match
  })
}

function htmlToText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h[1-6]|li|tr|section|article)>/gi, "\n")
      .replace(/<li\b[^>]*>/gi, "- ")
      .replace(/<[^>]+>/g, " "),
  )
}

async function extractPdf(bytes: Uint8Array): Promise<ExtractedPage[]> {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const loadingTask = getDocument({ data: bytes })
  const document = await loadingTask.promise
  const pages: ExtractedPage[] = []

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const content = await page.getTextContent()
      const text = content.items
        .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
        .join(" ")
      pages.push({ page: pageNumber, text })
      page.cleanup()
    }
  } finally {
    await loadingTask.destroy()
  }
  return assertText(pages)
}

async function extractDocx(bytes: Uint8Array): Promise<ExtractedPage[]> {
  const mammoth = await import("mammoth")
  const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) })
  return assertText([{ page: null, text: result.value }])
}

export async function extractDocument(
  bytes: Uint8Array,
  fileName: string,
  mimeType?: string | null,
): Promise<ExtractedPage[]> {
  const extension = fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? ""
  if (extension === ".pdf" || mimeType === "application/pdf") {
    return extractPdf(bytes)
  }
  if (
    extension === ".docx" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocx(bytes)
  }

  const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes)
  if ([".txt", ".md", ".csv"].includes(extension) || mimeType?.startsWith("text/plain")) {
    return assertText([{ page: null, text: decoded }])
  }
  if ([".html", ".htm"].includes(extension) || mimeType?.startsWith("text/html")) {
    return assertText([{ page: null, text: htmlToText(decoded) }])
  }

  throw new DocumentExtractionError(
    `Unsupported document format for ${fileName}; use PDF, DOCX, HTML, Markdown or text.`,
  )
}

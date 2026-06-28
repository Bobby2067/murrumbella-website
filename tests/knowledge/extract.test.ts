import { describe, expect, it } from "vitest"

import { extractDocument } from "@/lib/knowledge/extract"

describe("document extraction", () => {
  it("normalises text without removing clause numbers", async () => {
    const result = await extractDocument(
      new TextEncoder().encode("Clause   4.1\r\n\r\nMinimum   subdivision lot size"),
      "lep.txt",
    )

    expect(result).toEqual([
      { page: null, text: "Clause 4.1\n\nMinimum subdivision lot size" },
    ])
  })

  it("removes scripts and tags from HTML", async () => {
    const result = await extractDocument(
      new TextEncoder().encode("<h1>Clause 4.1</h1><script>ignore()</script><p>Minimum lot size</p>"),
      "lep.html",
    )

    expect(result[0].text).toContain("Clause 4.1")
    expect(result[0].text).toContain("Minimum lot size")
    expect(result[0].text).not.toContain("ignore")
  })

  it("rejects unsupported and empty documents", async () => {
    await expect(extractDocument(new Uint8Array([1, 2]), "map.jpg")).rejects.toThrow(/unsupported/i)
    await expect(extractDocument(new TextEncoder().encode("  "), "empty.txt")).rejects.toThrow(/no extractable text/i)
  })
})

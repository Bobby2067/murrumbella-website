import { describe, expect, it, vi } from "vitest"

import {
  encodeGraphPath,
  listSharePointFiles,
  type SharePointConfig,
} from "@/lib/knowledge/sharepoint"

const config: SharePointConfig = {
  tenantId: "tenant",
  clientId: "client",
  clientSecret: "secret",
  driveId: "drive",
  folderPath: "General/Murrumbella/FARM/Murrumbella - Property Dossier & IM",
}

describe("SharePoint Graph client", () => {
  it("encodes each path segment without losing separators", () => {
    expect(encodeGraphPath(config.folderPath)).toBe(
      "General/Murrumbella/FARM/Murrumbella%20-%20Property%20Dossier%20%26%20IM",
    )
  })

  it("follows pagination and recurses only below the configured folder", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            value: [
              {
                id: "a",
                name: "title-search.pdf",
                size: 20,
                eTag: "one",
                lastModifiedDateTime: "2026-06-01T00:00:00Z",
                file: { mimeType: "application/pdf" },
              },
              { id: "folder", name: "Planning", folder: { childCount: 1 } },
            ],
            "@odata.nextLink": "https://graph.microsoft.com/v1.0/next-page",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            value: [
              {
                id: "b",
                name: "planning-certificate-10-7.pdf",
                size: 30,
                eTag: "two",
                lastModifiedDateTime: "2026-06-02T00:00:00Z",
                file: { mimeType: "application/pdf" },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            value: [
              {
                id: "c",
                name: "yass-valley-lep-2013.pdf",
                size: 40,
                eTag: "three",
                lastModifiedDateTime: "2026-06-03T00:00:00Z",
                file: { mimeType: "application/pdf" },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )

    const files = await listSharePointFiles(fetchImpl, config, "token")

    expect(files.map((file) => file.name)).toEqual([
      "title-search.pdf",
      "planning-certificate-10-7.pdf",
      "yass-valley-lep-2013.pdf",
    ])
    expect(fetchImpl.mock.calls[0][0]).toContain(
      "Murrumbella%20-%20Property%20Dossier%20%26%20IM",
    )
    expect(fetchImpl.mock.calls[1][0]).toBe(
      "https://graph.microsoft.com/v1.0/next-page",
    )
    expect(fetchImpl.mock.calls[2][0]).toContain("/items/folder/children")
  })

  it("does not recurse into hidden metadata folders", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
        JSON.stringify({
          value: [
            { id: "git-folder", name: ".git", folder: { childCount: 500 } },
            {
              id: "document",
              name: "planning-certificate.pdf",
              size: 30,
              eTag: "one",
              lastModifiedDateTime: "2026-06-02T00:00:00Z",
              file: { mimeType: "application/pdf" },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValue(new Response(JSON.stringify({ value: [] })))

    const files = await listSharePointFiles(fetchImpl, config, "token")

    expect(files.map((file) => file.name)).toEqual(["planning-certificate.pdf"])
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it("throws without returning credentials in the error", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("unauthorised", { status: 401 }),
    )

    await expect(listSharePointFiles(fetchImpl, config, "very-secret-token")).rejects.toThrow(
      /401/,
    )
    await expect(listSharePointFiles(fetchImpl, config, "very-secret-token")).rejects.not.toThrow(
      /very-secret-token/,
    )
  })
})

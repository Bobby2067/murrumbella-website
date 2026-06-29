const GRAPH_ROOT = "https://graph.microsoft.com/v1.0"

export interface SharePointConfig {
  tenantId: string
  clientId: string
  clientSecret: string
  driveId: string
  folderPath: string
}

export interface SharePointFile {
  id: string
  name: string
  path: string
  size: number
  eTag: string | null
  lastModifiedAt: string | null
  mimeType: string | null
}

interface GraphItem {
  id?: unknown
  name?: unknown
  size?: unknown
  eTag?: unknown
  lastModifiedDateTime?: unknown
  file?: { mimeType?: unknown }
  folder?: { childCount?: unknown }
}

interface GraphPage {
  value?: GraphItem[]
  "@odata.nextLink"?: string
}

function required(value: string, name: string): string {
  if (!value.trim()) throw new Error(`${name} is required.`)
  return value
}

export function encodeGraphPath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")
}

export async function getGraphAccessToken(
  fetchImpl: typeof fetch,
  config: SharePointConfig,
): Promise<string> {
  const tenantId = required(config.tenantId, "MICROSOFT_TENANT_ID")
  const body = new URLSearchParams({
    client_id: required(config.clientId, "MICROSOFT_CLIENT_ID"),
    client_secret: required(config.clientSecret, "MICROSOFT_CLIENT_SECRET"),
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  })
  const response = await fetchImpl(
    `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(15_000),
    },
  )
  if (!response.ok) {
    throw new Error(`Microsoft identity token request failed with status ${response.status}.`)
  }
  const payload = (await response.json()) as { access_token?: unknown }
  if (typeof payload.access_token !== "string" || !payload.access_token) {
    throw new Error("Microsoft identity token response did not contain an access token.")
  }
  return payload.access_token
}

async function graphJson(
  fetchImpl: typeof fetch,
  url: string,
  accessToken: string,
): Promise<GraphPage> {
  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) {
    throw new Error(`Microsoft Graph request failed with status ${response.status}.`)
  }
  return (await response.json()) as GraphPage
}

function fileFromItem(item: GraphItem, parentPath: string): SharePointFile | null {
  if (
    typeof item.id !== "string" ||
    typeof item.name !== "string" ||
    !item.file
  ) {
    return null
  }
  return {
    id: item.id,
    name: item.name,
    path: `${parentPath.replace(/\/$/, "")}/${item.name}`,
    size: typeof item.size === "number" ? item.size : 0,
    eTag: typeof item.eTag === "string" ? item.eTag : null,
    lastModifiedAt:
      typeof item.lastModifiedDateTime === "string" ? item.lastModifiedDateTime : null,
    mimeType:
      typeof item.file.mimeType === "string" ? item.file.mimeType : null,
  }
}

export async function listSharePointFiles(
  fetchImpl: typeof fetch,
  config: SharePointConfig,
  suppliedAccessToken?: string,
): Promise<SharePointFile[]> {
  const driveId = required(config.driveId, "SHAREPOINT_DRIVE_ID")
  const folderPath = required(config.folderPath, "SHAREPOINT_FOLDER_PATH").replace(/^\/+|\/+$/g, "")
  const accessToken = suppliedAccessToken ?? (await getGraphAccessToken(fetchImpl, config))
  const select = "$select=id,name,size,eTag,lastModifiedDateTime,file,folder"
  const rootUrl = `${GRAPH_ROOT}/drives/${encodeURIComponent(driveId)}/root:/${encodeGraphPath(folderPath)}:/children?${select}`

  async function collect(initialUrl: string, parentPath: string): Promise<SharePointFile[]> {
    const files: SharePointFile[] = []
    const folders: Array<{ id: string; name: string }> = []
    let nextUrl: string | undefined = initialUrl

    while (nextUrl) {
      const page = await graphJson(fetchImpl, nextUrl, accessToken)
      for (const item of Array.isArray(page.value) ? page.value : []) {
        const file = fileFromItem(item, parentPath)
        if (file) files.push(file)
        if (
          item.folder &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          !item.name.startsWith(".")
        ) {
          folders.push({ id: item.id, name: item.name })
        }
      }
      nextUrl = typeof page["@odata.nextLink"] === "string" ? page["@odata.nextLink"] : undefined
    }

    for (const folder of folders) {
      const childUrl = `${GRAPH_ROOT}/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(folder.id)}/children?${select}`
      files.push(...(await collect(childUrl, `${parentPath}/${folder.name}`)))
    }
    return files
  }

  return collect(rootUrl, folderPath)
}

export async function downloadSharePointFile(
  fetchImpl: typeof fetch,
  driveId: string,
  itemId: string,
  accessToken: string,
): Promise<Uint8Array> {
  const response = await fetchImpl(
    `${GRAPH_ROOT}/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}/content`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      redirect: "follow",
      signal: AbortSignal.timeout(60_000),
    },
  )
  if (!response.ok) {
    throw new Error(`SharePoint file download failed with status ${response.status}.`)
  }
  return new Uint8Array(await response.arrayBuffer())
}

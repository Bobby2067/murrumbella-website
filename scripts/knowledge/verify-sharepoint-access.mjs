const required = (name) => {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required.`)
  return value
}

const tokenBody = new URLSearchParams({
  client_id: required("MICROSOFT_CLIENT_ID"),
  client_secret: required("MICROSOFT_CLIENT_SECRET"),
  scope: "https://graph.microsoft.com/.default",
  grant_type: "client_credentials",
})

const tokenResponse = await fetch(
  `https://login.microsoftonline.com/${required("MICROSOFT_TENANT_ID")}/oauth2/v2.0/token`,
  {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: tokenBody,
  },
)
const tokenData = await tokenResponse.json()
if (!tokenResponse.ok || typeof tokenData.access_token !== "string") {
  throw new Error(`Token request failed: ${tokenResponse.status}`)
}

const token = tokenData.access_token
const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"))
const applicationRoles = [...(claims.roles || [])].sort()
if (applicationRoles.join(",") !== "Sites.Selected") {
  throw new Error(`Unexpected application roles: ${applicationRoles.join(",")}`)
}

async function graph(path) {
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return { status: response.status, data: await response.json() }
}

const site = await graph(
  `/sites/${encodeURIComponent(required("SHAREPOINT_SITE_ID"))}?$select=id,displayName`,
)
if (site.status !== 200) throw new Error(`Selected site read failed: ${site.status}`)

const encodedFolderPath = required("SHAREPOINT_FOLDER_PATH")
  .split("/")
  .map(encodeURIComponent)
  .join("/")
const folder = await graph(
  `/drives/${encodeURIComponent(required("SHAREPOINT_DRIVE_ID"))}/root:/${encodedFolderPath}?$select=id,folder`,
)
if (folder.status !== 200 || !folder.data.folder) {
  throw new Error(`Selected folder read failed: ${folder.status}`)
}

const tenantSearch = await graph("/sites?search=*")
if (tenantSearch.status !== 403) {
  throw new Error(`Tenant-wide site enumeration was not blocked: ${tenantSearch.status}`)
}

console.log(
  JSON.stringify({
    applicationRoles,
    selectedSiteRead: true,
    selectedFolderRead: true,
    tenantWideEnumerationBlocked: true,
  }),
)

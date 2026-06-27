export type Tier = "registered" | "qualified"

export interface DossierDoc {
  key: string
  label: string
  description: string
  category: string
  tier: Tier
  file: string
  mime: string
}

/**
 * The private data room. `tier` controls access:
 *  - "registered": any signed-in user (Layer 2)
 *  - "qualified":  only users the owner has approved (Layer 3)
 * `file` is the name inside /protected-docs (never served statically).
 */
export const DOSSIER_DOCS: DossierDoc[] = [
  // ---- Layer 2 — registered ----
  {
    key: "planning-certificate",
    label: "Section 10.7 Planning Certificate",
    description: "Yass Valley Council zoning (RU1), permitted uses and site constraints.",
    category: "Planning",
    tier: "registered",
    file: "planning-certificate-10-7.pdf",
    mime: "application/pdf",
  },
  {
    key: "topography-map",
    label: "Topography Map",
    description: "Contour and topographic overview of the 164-hectare property.",
    category: "Maps & Plans",
    tier: "registered",
    file: "topography-map.jpg",
    mime: "image/jpeg",
  },

  // ---- Layer 3 — qualified ----
  {
    key: "title-search",
    label: "Title Search",
    description: "Current certificate of title — Lot 154 DP 751834.",
    category: "Legal & Title",
    tier: "qualified",
    file: "title-search.pdf",
    mime: "application/pdf",
  },
  {
    key: "land-value-search",
    label: "Land Value Search (NSW)",
    description: "NSW Valuer General land value record.",
    category: "Legal & Title",
    tier: "qualified",
    file: "land-value-search.pdf",
    mime: "application/pdf",
  },
  {
    key: "crown-plan",
    label: "Crown Plan",
    description: "Historical Crown plan for the parcel.",
    category: "Legal & Title",
    tier: "qualified",
    file: "crown-plan.pdf",
    mime: "application/pdf",
  },
  {
    key: "dp-806324",
    label: "Deposited Plan DP 806324",
    description: "Registered deposited plan.",
    category: "Deposited Plans",
    tier: "qualified",
    file: "deposited-plan-dp806324.pdf",
    mime: "application/pdf",
  },
  {
    key: "dp-587571",
    label: "Deposited Plan DP 587571",
    description: "Registered deposited plan.",
    category: "Deposited Plans",
    tier: "qualified",
    file: "deposited-plan-dp587571.pdf",
    mime: "application/pdf",
  },
  {
    key: "dp-588350",
    label: "Deposited Plan DP 588350",
    description: "Registered deposited plan.",
    category: "Deposited Plans",
    tier: "qualified",
    file: "deposited-plan-dp588350.pdf",
    mime: "application/pdf",
  },
  {
    key: "dp-639390",
    label: "Deposited Plan DP 639390",
    description: "Registered deposited plan.",
    category: "Deposited Plans",
    tier: "qualified",
    file: "deposited-plan-dp639390.pdf",
    mime: "application/pdf",
  },
  {
    key: "dp-644034",
    label: "Deposited Plan DP 644034",
    description: "Registered deposited plan.",
    category: "Deposited Plans",
    tier: "qualified",
    file: "deposited-plan-dp644034.pdf",
    mime: "application/pdf",
  },
  {
    key: "88b-1",
    label: "88B Instrument (1)",
    description: "Easements, covenants and restrictions affecting the title.",
    category: "Easements & Restrictions",
    tier: "qualified",
    file: "instrument-88b-1.pdf",
    mime: "application/pdf",
  },
  {
    key: "88b-2",
    label: "88B Instrument (2)",
    description: "Easements, covenants and restrictions affecting the title.",
    category: "Easements & Restrictions",
    tier: "qualified",
    file: "instrument-88b-2.pdf",
    mime: "application/pdf",
  },
  {
    key: "88b-3",
    label: "88B Instrument (3)",
    description: "Easements, covenants and restrictions affecting the title.",
    category: "Easements & Restrictions",
    tier: "qualified",
    file: "instrument-88b-3.pdf",
    mime: "application/pdf",
  },
]

export function docsForTier(tier: Tier): DossierDoc[] {
  if (tier === "qualified") return DOSSIER_DOCS
  return DOSSIER_DOCS.filter((d) => d.tier === "registered")
}

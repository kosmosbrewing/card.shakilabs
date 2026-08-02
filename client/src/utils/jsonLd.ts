export type JsonLdEntry = Record<string, unknown>;

export type JsonLdScriptInput = {
  key: string;
  type: "application/ld+json";
  textContent: string;
};

// Reads the @type of every JSON-LD block the served HTML already contains.
export function collectJsonLdTypes(root: ParentNode): Set<string> {
  const types = new Set<string>();

  root.querySelectorAll('script[type="application/ld+json"]').forEach((node) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(node.textContent ?? "");
    } catch {
      // A malformed static block must never break head rendering.
      return;
    }

    for (const entry of Array.isArray(parsed) ? parsed : [parsed]) {
      if (!entry || typeof entry !== "object") continue;
      const type = (entry as JsonLdEntry)["@type"];
      if (typeof type === "string") types.add(type);
    }
  });

  return types;
}

// Builds the <script> descriptors handed to unhead.
//
// `textContent` — not `children` — is the field @unhead/vue v2 understands.
// v2 only treats `key`/`innerHTML`/`textContent`/`tagPosition`/`tagPriority`/
// `tagDuplicateStrategy`/`processTemplateParams` as tag config; anything else
// becomes an HTML attribute, so `children` used to render as
// `<script type="application/ld+json" children="{...}">` with an empty body.
//
// `presentTypes` holds the @types the served HTML already ships. Re-emitting one
// would leave two blocks of the same entity on a single page (Google allows only
// one FAQPage per page).
export function buildJsonLdScripts(
  entries: readonly JsonLdEntry[],
  presentTypes: ReadonlySet<string>,
): JsonLdScriptInput[] {
  return entries
    .filter((entry) => {
      const type = entry["@type"];
      return typeof type !== "string" || !presentTypes.has(type);
    })
    .map((entry, index) => ({
      key: `json-ld-${index}`,
      type: "application/ld+json" as const,
      textContent: JSON.stringify(entry),
    }));
}

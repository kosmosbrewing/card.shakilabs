import { describe, expect, it, vi } from "vitest";
import { buildJsonLdScripts, collectJsonLdTypes } from "./jsonLd";

function fakeRoot(bodies: (string | null)[]): ParentNode {
  return {
    querySelectorAll: vi.fn(() => bodies.map((textContent) => ({ textContent }))),
  } as unknown as ParentNode;
}

describe("collectJsonLdTypes", () => {
  it("reads @type from single-object and array payloads", () => {
    const root = fakeRoot([
      JSON.stringify({ "@type": "WebApplication" }),
      JSON.stringify([
        { "@type": "WebPage" },
        { "@type": "BreadcrumbList" },
        { "@type": "FAQPage" },
      ]),
    ]);

    expect(collectJsonLdTypes(root)).toEqual(
      new Set(["WebApplication", "WebPage", "BreadcrumbList", "FAQPage"]),
    );
    expect(root.querySelectorAll).toHaveBeenCalledWith(
      'script[type="application/ld+json"]',
    );
  });

  it("ignores malformed, empty and non-object payloads", () => {
    const root = fakeRoot(["{ not json", "", null, JSON.stringify(["plain"])]);

    expect(collectJsonLdTypes(root)).toEqual(new Set());
  });
});

describe("buildJsonLdScripts", () => {
  // Regression guard: `children` renders as an attribute in @unhead/vue v2 and
  // leaves the script body empty.
  it("puts the payload in textContent and never in children", () => {
    const [script] = buildJsonLdScripts([{ "@type": "FAQPage" }], new Set());

    expect(script.textContent).toBe('{"@type":"FAQPage"}');
    expect(script.type).toBe("application/ld+json");
    expect(script).not.toHaveProperty("children");
  });

  it("drops entries whose @type the served HTML already ships", () => {
    const scripts = buildJsonLdScripts(
      [{ "@type": "FAQPage" }, { "@type": "ItemList" }],
      new Set(["FAQPage"]),
    );

    expect(scripts.map((script) => JSON.parse(script.textContent)["@type"])).toEqual([
      "ItemList",
    ]);
  });

  it("keeps entries without a string @type and numbers keys from zero", () => {
    const scripts = buildJsonLdScripts(
      [{ name: "no type" }, { "@type": "ItemList" }],
      new Set(["FAQPage"]),
    );

    expect(scripts.map((script) => script.key)).toEqual(["json-ld-0", "json-ld-1"]);
  });
});

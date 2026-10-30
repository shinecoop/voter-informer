import { describe, expect, it } from "vitest";
import { sourceTextUrl } from "../src/domain/source-link";

describe("evidence text-fragment links", () => {
  it("targets the original excerpt, normalizing whitespace and encoding fragment delimiters", () => {
    const excerpt = "  Common-sense laws,\n benefits & veterans’ rights.  ";
    const url = new URL(sourceTextUrl("https://example.com/issues?year=2026", excerpt));
    expect(url.search).toBe("?year=2026");
    expect(url.hash).toContain("Common%2Dsense");
    expect(url.hash).toContain("%2C");
    expect(url.hash).toContain("%26");
    expect(decodeURIComponent(url.hash.slice("#:~:text=".length))).toBe("Common-sense laws, benefits & veterans’ rights.");
  });
  it("keeps an existing section anchor as the fallback and replaces old directives", () => {
    expect(sourceTextUrl("https://example.com/issues#health:~:text=old", "public option")).toBe("https://example.com/issues#health:~:text=public%20option");
  });
  it("disambiguates a section heading from earlier mentions using its following text", () => {
    expect(sourceTextUrl("https://example.com/values/", "Health Care", "Housing Affordability")).toBe("https://example.com/values/#:~:text=Health%20Care,-Housing%20Affordability");
  });
  it("does not invent a highlight for an empty excerpt", () => {
    expect(sourceTextUrl("https://example.com/#health", "\n ")).toBe("https://example.com/#health");
  });
});

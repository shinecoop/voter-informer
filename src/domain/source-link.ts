/** Link to source text, optionally disambiguated by the text immediately following it. */
export function sourceTextUrl(sourceUrl: string, excerpt: string, followingText?: string): string {
  const text = excerpt.replace(/\s+/g, " ").trim();
  if (!text) return sourceUrl;
  const url = new URL(sourceUrl);
  const section = url.hash.slice(1).split(":~:")[0];
  // Hyphens delimit text-fragment context, so encode them even though URI encoding leaves them safe.
  const encode = (value: string) => encodeURIComponent(value).replace(/-/g, "%2D");
  const suffix = followingText?.replace(/\s+/g, " ").trim();
  url.hash = `${section}:~:text=${encode(text)}${suffix ? `,-${encode(suffix)}` : ""}`;
  return url.href;
}

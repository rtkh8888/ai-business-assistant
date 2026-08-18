function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function stripTags(input: string) {
  return collapseWhitespace(decodeEntities(input.replace(/<[^>]*>/g, " ")));
}

export function normalizeTextList(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => collapseWhitespace(decodeEntities(value)))
        .filter(Boolean),
    ),
  );
}

export function safeUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function resolveUrl(baseUrl: string, href: string | null | undefined) {
  if (!href) return null;
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("javascript:") || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) {
    return null;
  }

  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return null;
  }
}

export function removeScriptsAndStyles(html: string) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ");
}

export function removeNoiseBlocks(html: string) {
  return html
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header\b[\s\S]*?<\/header>/gi, " ")
    .replace(/<cookie[^>]*>[\s\S]*?<\/cookie>/gi, " ")
    .replace(/cookie[^>]*banner/gi, " ");
}

export function extractAttributePairs(tagSource: string, attribute: string) {
  const values: string[] = [];
  const matcher = new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "gi");
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(tagSource))) {
    values.push(match[1]);
  }
  return values;
}

export function pickMetaContent(html: string, name: string) {
  const pattern = new RegExp(
    `<meta[^>]*?(?:name|property)=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*?content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const match = html.match(pattern);
  return match ? collapseWhitespace(decodeEntities(match[1])) : "";
}

export function pickCanonicalUrl(html: string, baseUrl: string) {
  const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  if (!match) return null;
  return resolveUrl(baseUrl, match[1]);
}

export function parseTagAttributes(tag: string) {
  const attributes: Record<string, string> = {};
  const matcher = /([a-zA-Z_:][\w:.-]*)\s*=\s*["']([^"']*)["']/g;
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(tag))) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[2]);
  }
  return attributes;
}

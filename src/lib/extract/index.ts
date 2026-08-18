import {
  extractAttributePairs,
  normalizeTextList,
  parseTagAttributes,
  pickCanonicalUrl,
  pickMetaContent,
  removeNoiseBlocks,
  removeScriptsAndStyles,
  resolveUrl,
  safeUrl,
  stripTags,
} from "./utils";
import type {
  BrowserFallbackRenderer,
  ExtractedButton,
  ExtractedForm,
  ExtractedLink,
  WebsiteExtractionResult,
  WebsiteFetchOptions,
} from "./types";

const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function createEmptyResult(inputUrl: string, finalUrl: string): WebsiteExtractionResult {
  return {
    input_url: inputUrl,
    final_url: finalUrl,
    canonical_url: null,
    title: "Unknown",
    meta_description: "Unknown",
    headings: [],
    body_text: "",
    buttons: [],
    links: [],
    forms: [],
    detected_signals: {
      has_contact_page: false,
      has_booking_link: false,
      has_testimonials: false,
      has_pricing: false,
      has_whatsapp: false,
      has_cta: false,
      cta_examples: [],
    },
    extraction_quality: "partial",
    needs_browser_rendering: false,
    fallback_reason: null,
  };
}

async function fetchHomepageHtml(url: string, options: WebsiteFetchOptions = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": options.userAgent ?? DEFAULT_USER_AGENT,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const html = await response.text();
    return {
      html,
      finalUrl: response.url || url,
      ok: response.ok,
      status: response.status,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isAbort = error instanceof Error && error.name === "AbortError";

    return {
      html: "",
      finalUrl: url,
      ok: false,
      status: isAbort ? 408 : 0,
      errorMessage: isAbort ? "Request timed out." : message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function extractHeadings(html: string) {
  const headings: string[] = [];
  const matcher = /<(h[1-3])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(html))) {
    const value = stripTags(match[2]);
    if (value) headings.push(value);
  }
  return normalizeTextList(headings);
}

function extractBodyText(html: string) {
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  const source = bodyMatch ? bodyMatch[1] : html;
  const stripped = stripTags(removeNoiseBlocks(removeScriptsAndStyles(source)));
  return stripped;
}

function extractLinks(html: string, baseUrl: string) {
  const links: ExtractedLink[] = [];
  const matcher = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(html))) {
    const href = resolveUrl(baseUrl, match[1]);
    if (!href) continue;
    const text = stripTags(match[2]);
    links.push({ text: text || href, href });
  }
  return links;
}

function extractButtons(html: string, baseUrl: string) {
  const buttons: ExtractedButton[] = [];

  const buttonMatcher = /<button\b[^>]*>([\s\S]*?)<\/button>/gi;
  let buttonMatch: RegExpExecArray | null;
  while ((buttonMatch = buttonMatcher.exec(html))) {
    const rawTag = buttonMatch[0];
    const attrs = parseTagAttributes(rawTag);
    const text = stripTags(buttonMatch[1]);
    if (!text) continue;
    buttons.push({
      text,
      type: attrs.type === "submit" ? "submit" : "button",
    });
  }

  const anchorMatcher = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let anchorMatch: RegExpExecArray | null;
  while ((anchorMatch = anchorMatcher.exec(html))) {
    const href = resolveUrl(baseUrl, anchorMatch[1]);
    const text = stripTags(anchorMatch[2]);
    if (!href || !text) continue;
    if (/book|schedule|contact|quote|demo|request|appointment|reserve|get started|call now/i.test(text)) {
      buttons.push({
        text,
        type: "anchor",
        href,
      });
    }
  }

  return buttons;
}

function extractForms(html: string, baseUrl: string) {
  const forms: ExtractedForm[] = [];
  const formMatcher = /<form\b[\s\S]*?<\/form>/gi;
  let formMatch: RegExpExecArray | null;
  while ((formMatch = formMatcher.exec(html))) {
    const formSource = formMatch[0];
    const attrs = parseTagAttributes(formSource);
    const action = resolveUrl(baseUrl, attrs.action) ?? attrs.action ?? null;
    const method = attrs.method ? attrs.method.toLowerCase() : null;
    const inputNames = normalizeTextList(extractAttributePairs(formSource, "name"));
    forms.push({
      action,
      method,
      inputNames,
    });
  }
  return forms;
}

function extractTitle(html: string) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripTags(match[1]) || "Unknown" : "Unknown";
}

function detectSignals({ html, links, bodyText, buttons }: { html: string; links: ExtractedLink[]; bodyText: string; buttons: ExtractedButton[]; }) {
  const linkTexts = links.map((link) => `${link.text} ${link.href}`).join(" ").toLowerCase();
  const buttonTexts = buttons.map((button) => button.text).join(" ").toLowerCase();
  const combined = `${html} ${bodyText} ${linkTexts} ${buttonTexts}`.toLowerCase();
  const ctaExamples = buttons
    .map((button) => button.text)
    .filter((text) => /book|schedule|contact|quote|demo|request|appointment|reserve|get started|call now|learn more|get a quote/i.test(text))
    .slice(0, 10);

  return {
    has_contact_page: /\/contact\b|contact us|get in touch/i.test(linkTexts) || /contact/i.test(combined),
    has_booking_link: /book|schedule|appointment|reserve|calendar|calendly|booking/i.test(linkTexts + " " + combined),
    has_testimonials: /testimonial|reviews?|what our clients say|happy customers/i.test(combined),
    has_pricing: /pricing|plans?|packages?|starting at|\$\s?\d/i.test(combined),
    has_whatsapp: /whatsapp|wa\.me|api\.whatsapp\.com/i.test(combined),
    has_cta: ctaExamples.length > 0,
    cta_examples: ctaExamples,
  };
}

function determineQuality({
  html,
  bodyText,
  signals,
  status,
}: {
  html: string;
  bodyText: string;
  signals: ReturnType<typeof detectSignals>;
  status: number;
}) {
  if (status >= 400) return "partial" as const;
  if (bodyText.length < 200 || html.length < 800 || (!signals.has_cta && bodyText.length < 500)) {
    return "partial" as const;
  }
  return "good" as const;
}

function shouldUseBrowserFallback({
  html,
  bodyText,
  status,
}: {
  html: string;
  bodyText: string;
  status: number;
}) {
  if (status >= 400) return false;
  if (bodyText.length < 200) return true;
  if (html.length < 800) return true;
  if (/<script\b[^>]*src=["'][^"']*(react|next|vue|nuxt|svelte|app)\b/i.test(html)) return true;
  if (/<div[^>]*id=["']root["']|<div[^>]*id=["']__next["']/i.test(html) && bodyText.length < 500) return true;
  return false;
}

export async function extractWebsite(
  inputUrl: string,
  options: WebsiteFetchOptions & {
    browserFallbackRenderer?: BrowserFallbackRenderer;
  } = {},
): Promise<WebsiteExtractionResult> {
  const parsedInput = safeUrl(inputUrl);
  if (!parsedInput) {
    throw new Error("Invalid website URL.");
  }

  const initial = await fetchHomepageHtml(parsedInput.toString(), options);
  const baseResult = createEmptyResult(parsedInput.toString(), initial.finalUrl);

  if (initial.status === 0 || (initial.status === 408 && !initial.html)) {
    return {
      ...baseResult,
      fallback_reason: initial.errorMessage ?? "Unable to fetch website content.",
    };
  }

  const title = extractTitle(initial.html);
  const bodyText = extractBodyText(initial.html);
  const links = extractLinks(initial.html, initial.finalUrl);
  const buttons = extractButtons(initial.html, initial.finalUrl);
  const forms = extractForms(initial.html, initial.finalUrl);
  const headings = extractHeadings(initial.html);
  const signals = detectSignals({ html: initial.html, links, bodyText, buttons });
  const needsBrowserRendering = shouldUseBrowserFallback({
    html: initial.html,
    bodyText,
    status: initial.status,
  });
  const canonicalUrl = pickCanonicalUrl(initial.html, initial.finalUrl);

  let result: WebsiteExtractionResult = {
    ...baseResult,
    final_url: initial.finalUrl,
    canonical_url: canonicalUrl,
    title,
    meta_description: pickMetaContent(initial.html, "description") || "Unknown",
    headings,
    body_text: bodyText,
    buttons,
    links,
    forms,
    detected_signals: signals,
    extraction_quality: determineQuality({
      html: initial.html,
      bodyText,
      signals,
      status: initial.status,
    }),
    needs_browser_rendering: needsBrowserRendering,
    fallback_reason: needsBrowserRendering ? "Content appears too sparse or JavaScript-heavy for reliable HTTP-only extraction." : null,
  };

  if (needsBrowserRendering && options.browserFallbackRenderer) {
    const renderedHtml = await options.browserFallbackRenderer(initial.finalUrl);
    if (renderedHtml) {
      const renderedTitle = extractTitle(renderedHtml);
      const renderedBodyText = extractBodyText(renderedHtml);
      const renderedLinks = extractLinks(renderedHtml, initial.finalUrl);
      const renderedButtons = extractButtons(renderedHtml, initial.finalUrl);
      const renderedForms = extractForms(renderedHtml, initial.finalUrl);
      const renderedHeadings = extractHeadings(renderedHtml);
      const renderedSignals = detectSignals({
        html: renderedHtml,
        links: renderedLinks,
        bodyText: renderedBodyText,
        buttons: renderedButtons,
      });

      result = {
        ...result,
        title: renderedTitle || result.title,
        meta_description: pickMetaContent(renderedHtml, "description") || result.meta_description,
        headings: renderedHeadings.length ? renderedHeadings : result.headings,
        body_text: renderedBodyText || result.body_text,
        buttons: renderedButtons.length ? renderedButtons : result.buttons,
        links: renderedLinks.length ? renderedLinks : result.links,
        forms: renderedForms.length ? renderedForms : result.forms,
        detected_signals: renderedSignals,
        extraction_quality: determineQuality({
          html: renderedHtml,
          bodyText: renderedBodyText,
          signals: renderedSignals,
          status: 200,
        }),
        needs_browser_rendering: false,
        fallback_reason: null,
      };
    }
  }

  return result;
}

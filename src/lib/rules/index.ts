import type { WebsiteExtractionResult } from "@/lib/extract";
import { serviceTaxonomy, type ServiceTaxonomyKey } from "./taxonomy";
import type { RuleBasedAnalysis, RuleEvidence, RuleBasedRecommendation } from "./types";

export * from "./types";
export * from "./taxonomy";

const LOCAL_BUSINESS_PATTERNS = [
  /\bnear me\b/i,
  /\bservice area\b/i,
  /\bcall us\b/i,
  /\bcontact us\b/i,
  /\bbook a call\b/i,
  /\bbook an appointment\b/i,
  /\bclinic\b/i,
  /\bdentist\b/i,
  /\bplumber\b/i,
  /\belectrician\b/i,
  /\blaw firm\b/i,
  /\breal estate\b/i,
  /\brestaurant\b/i,
  /\bspa\b/i,
  /\bgym\b/i,
];

const AUTOMATION_PATTERNS = [
  /\bautomation\b/i,
  /\bworkflow\b/i,
  /\bworkflows\b/i,
  /\bintegration\b/i,
  /\bintegrations\b/i,
  /\bops\b/i,
  /\bsystems?\b/i,
  /\bautomation ops\b/i,
];

function joinSignals(extraction: WebsiteExtractionResult) {
  return [
    extraction.title,
    extraction.meta_description,
    extraction.body_text,
    extraction.headings.join(" "),
    extraction.links.map((link) => `${link.text} ${link.href}`).join(" "),
    extraction.buttons.map((button) => button.text).join(" "),
    extraction.forms.map((form) => [form.action, form.method, form.inputNames.join(" ")].join(" ")).join(" "),
    extraction.detected_signals.cta_examples.join(" "),
  ]
    .filter(Boolean)
    .join(" ");
}

function hasPattern(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

function detectLocalBusiness(text: string) {
  return hasPattern(text, LOCAL_BUSINESS_PATTERNS);
}

function detectAutomationOps(text: string) {
  return hasPattern(text, AUTOMATION_PATTERNS);
}

function confidenceFromPresence(present: boolean, stronger = false) {
  if (!present) return 0.2;
  return stronger ? 0.92 : 0.8;
}

function buildEvidence(
  key: RuleEvidence["key"],
  present: boolean,
  details: string,
  stronger = false,
): RuleEvidence {
  return {
    key,
    present,
    confidence: confidenceFromPresence(present, stronger),
    details,
  };
}

function pickRecommendation(extraction: WebsiteExtractionResult, combinedText: string): RuleBasedRecommendation {
  const signals = extraction.detected_signals;
  const localBusiness = detectLocalBusiness(combinedText);
  const automationOps = detectAutomationOps(combinedText);

  if (localBusiness && !signals.has_booking_link && !signals.has_contact_page) {
    return {
      key: "local_seo_optimization",
      label: serviceTaxonomy.local_seo_optimization.label,
      reason: "This looks like a local service business with weak visibility for contact and booking intent.",
    };
  }

  if (signals.has_booking_link || extraction.forms.length > 0) {
    return {
      key: "booking_funnel_setup",
      label: serviceTaxonomy.booking_funnel_setup.label,
      reason: "The site already shows booking or form intent, so improving the funnel should move fastest.",
    };
  }

  if (!signals.has_cta || !signals.has_contact_page) {
    return {
      key: "website_conversion_audit",
      label: serviceTaxonomy.website_conversion_audit.label,
      reason: "The homepage does not show a clear conversion path, so conversion work is the highest leverage fix.",
    };
  }

  if (signals.has_testimonials && !signals.has_pricing) {
    return {
      key: "review_reputation_system",
      label: serviceTaxonomy.review_reputation_system.label,
      reason: "The site already has trust signals, but it still needs a stronger review and proof system.",
    };
  }

  if (combinedText.length > 900 && !signals.has_pricing) {
    return {
      key: "seo_content_system",
      label: serviceTaxonomy.seo_content_system.label,
      reason: "The site has enough content to support an SEO content system but is missing clear search-led structure.",
    };
  }

  if (signals.has_whatsapp && signals.has_contact_page && signals.has_cta) {
    return {
      key: "lead_capture_automation",
      label: serviceTaxonomy.lead_capture_automation.label,
      reason: "The site uses WhatsApp as an intake path, so the lead capture flow can be streamlined further.",
    };
  }

  if (automationOps) {
    return {
      key: "ai_automation_ops",
      label: serviceTaxonomy.ai_automation_ops.label,
      reason: "The homepage language points to automation, workflows, or operational tooling.",
    };
  }

  if (!signals.has_pricing || !signals.has_testimonials) {
    return {
      key: "copywriting_offer_positioning",
      label: serviceTaxonomy.copywriting_offer_positioning.label,
      reason: "The site needs stronger messaging, proof, or offer clarity before more advanced growth work.",
    };
  }

  return {
    key: "copywriting_offer_positioning",
    label: serviceTaxonomy.copywriting_offer_positioning.label,
    reason: "The site needs stronger messaging, proof, or offer clarity before more advanced growth work.",
  };
}

function buildStrengths(extraction: WebsiteExtractionResult) {
  const strengths: string[] = [];

  if (extraction.detected_signals.has_cta) strengths.push("Clear call-to-action copy is present.");
  if (extraction.detected_signals.has_contact_page) strengths.push("A contact path is visible.");
  if (extraction.detected_signals.has_booking_link || extraction.forms.length > 0) {
    strengths.push("The site offers a direct booking or intake path.");
  }
  if (extraction.detected_signals.has_testimonials) strengths.push("Social proof is present.");
  if (extraction.detected_signals.has_whatsapp) strengths.push("WhatsApp contact is available.");
  if (extraction.detected_signals.has_pricing) strengths.push("Pricing or package signals are visible.");
  if (extraction.extraction_quality === "good") strengths.push("The homepage extraction is readable and complete.");

  return strengths;
}

function buildWeaknesses(extraction: WebsiteExtractionResult) {
  const weaknesses: string[] = [];

  if (!extraction.detected_signals.has_cta) weaknesses.push("The homepage does not show a strong CTA.");
  if (!extraction.detected_signals.has_contact_page) weaknesses.push("There is no obvious contact path on the homepage.");
  if (!extraction.detected_signals.has_booking_link && extraction.forms.length === 0) {
    weaknesses.push("No clear booking or intake funnel is visible.");
  }
  if (!extraction.detected_signals.has_testimonials) weaknesses.push("Social proof is not obvious.");
  if (!extraction.detected_signals.has_pricing) weaknesses.push("Pricing visibility is weak or absent.");
  if (extraction.extraction_quality !== "good") weaknesses.push("The extracted homepage content is incomplete or noisy.");

  return weaknesses;
}

function buildNotes(extraction: WebsiteExtractionResult, localBusiness: boolean) {
  const notes: string[] = [];

  if (localBusiness) notes.push("Local business language detected.");
  if (extraction.needs_browser_rendering) notes.push("Browser rendering was likely needed for fuller coverage.");
  if (extraction.fallback_reason) notes.push(extraction.fallback_reason);
  if (extraction.detected_signals.cta_examples.length > 0) {
    notes.push(`CTA examples: ${extraction.detected_signals.cta_examples.slice(0, 3).join(", ")}`);
  }

  return notes;
}

export function analyzeWebsiteRules(extraction: WebsiteExtractionResult): RuleBasedAnalysis {
  const combinedText = joinSignals(extraction);
  const localBusiness = detectLocalBusiness(combinedText);
  const recommendation = pickRecommendation(extraction, combinedText);
  const evidence: RuleEvidence[] = [
    buildEvidence(
      "contact_page",
      extraction.detected_signals.has_contact_page,
      extraction.detected_signals.has_contact_page ? "Contact path detected in links or text." : "No obvious contact path detected.",
    ),
    buildEvidence(
      "booking_link",
      extraction.detected_signals.has_booking_link,
      extraction.detected_signals.has_booking_link ? "Booking language or link found." : "No booking link detected.",
    ),
    buildEvidence(
      "booking_form",
      extraction.forms.length > 0,
      extraction.forms.length > 0 ? "One or more forms are present." : "No forms detected.",
    ),
    buildEvidence(
      "testimonials",
      extraction.detected_signals.has_testimonials,
      extraction.detected_signals.has_testimonials ? "Testimonials or review language detected." : "No testimonial language detected.",
    ),
    buildEvidence(
      "pricing",
      extraction.detected_signals.has_pricing,
      extraction.detected_signals.has_pricing ? "Pricing language or price markers detected." : "No pricing signals detected.",
    ),
    buildEvidence(
      "whatsapp",
      extraction.detected_signals.has_whatsapp,
      extraction.detected_signals.has_whatsapp ? "WhatsApp contact path detected." : "No WhatsApp signal detected.",
    ),
    buildEvidence(
      "cta",
      extraction.detected_signals.has_cta,
      extraction.detected_signals.has_cta
        ? `CTA examples: ${extraction.detected_signals.cta_examples.slice(0, 2).join(", ")}`
        : "No CTA language detected.",
    ),
    buildEvidence(
      "sparse_content",
      extraction.extraction_quality !== "good",
      extraction.extraction_quality !== "good" ? "Extraction quality is partial or fallback." : "Extraction quality is good.",
    ),
    buildEvidence(
      "js_heavy",
      extraction.needs_browser_rendering,
      extraction.needs_browser_rendering ? "The page looks JavaScript-heavy or too sparse for HTTP-only extraction." : "HTTP extraction appears sufficient.",
    ),
    buildEvidence(
      "local_business",
      localBusiness,
      localBusiness ? "Local business intent detected in the homepage text." : "No local-business pattern detected.",
    ),
  ];

  return {
    analysis_version: "v1",
    rule_version: "v1",
    input_url: extraction.input_url,
    final_url: extraction.final_url,
    business_name: extraction.title || "Unknown",
    extracted_summary: extraction.meta_description || extraction.body_text.slice(0, 180) || "Unknown",
    strengths: buildStrengths(extraction),
    weaknesses: buildWeaknesses(extraction),
    evidence,
    recommendation,
    notes: buildNotes(extraction, localBusiness),
  };
}

export function getServiceLabel(key: ServiceTaxonomyKey) {
  return serviceTaxonomy[key].label;
}

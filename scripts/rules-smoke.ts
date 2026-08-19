import { analyzeWebsiteRules, type RuleEvidence } from "../src/lib/rules";
import type { WebsiteExtractionResult } from "../src/lib/extract";

function baseExtraction(overrides: Partial<WebsiteExtractionResult>): WebsiteExtractionResult {
  return {
    input_url: "https://example.com/",
    final_url: "https://example.com/",
    canonical_url: "https://example.com/",
    title: "Example",
    meta_description: "Example business website.",
    headings: [],
    body_text: "Example business website.",
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
    extraction_quality: "good",
    needs_browser_rendering: false,
    fallback_reason: null,
    ...overrides,
  };
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const fixtures: Array<{
    name: string;
    extraction: WebsiteExtractionResult;
    expectedKey: string;
    signalChecks?: Array<[key: RuleEvidence["key"], expected: boolean]>;
  }> = [
    {
      name: "local-seo",
      extraction: baseExtraction({
        title: "Downtown Dental Clinic",
        body_text: "Downtown Dental Clinic serves families near me in the city centre.",
        headings: ["Family dental care"],
      }),
      expectedKey: "local_seo_optimization",
    },
    {
      name: "conversion-audit",
      extraction: baseExtraction({
        title: "Creative Agency",
        body_text: "We build brands and websites. No clear conversion path is shown.",
        meta_description: "Creative studio for ambitious brands.",
      }),
      expectedKey: "website_conversion_audit",
    },
    {
      name: "booking-funnel",
      extraction: baseExtraction({
        title: "Skin Clinic",
        body_text: "Book an appointment online. Our calendar is open all week.",
        detected_signals: {
          has_contact_page: true,
          has_booking_link: true,
          has_testimonials: true,
          has_pricing: true,
          has_whatsapp: false,
          has_cta: true,
          cta_examples: ["Book Now"],
        },
        forms: [{ action: "/book", method: "post", inputNames: ["name", "email"] }],
      }),
      expectedKey: "booking_funnel_setup",
    },
    {
      name: "reputation-system",
      extraction: baseExtraction({
        title: "Law Office",
        body_text: "Our clients say we are responsive and thorough.",
        detected_signals: {
          has_contact_page: true,
          has_booking_link: false,
          has_testimonials: true,
          has_pricing: false,
          has_whatsapp: false,
          has_cta: true,
          cta_examples: ["Contact Us"],
        },
      }),
      expectedKey: "review_reputation_system",
    },
    {
      name: "copywriting",
      extraction: baseExtraction({
        title: "Consulting Co",
        body_text: "Clear offer, but not much proof or pricing structure is visible.",
        detected_signals: {
          has_contact_page: true,
          has_booking_link: false,
          has_testimonials: false,
          has_pricing: true,
          has_whatsapp: false,
          has_cta: true,
          cta_examples: ["Get Started"],
        },
      }),
      expectedKey: "copywriting_offer_positioning",
    },
    {
      name: "lead-capture",
      extraction: baseExtraction({
        title: "Home Services",
        body_text: "Get a quote. We help homeowners schedule work quickly.",
        detected_signals: {
          has_contact_page: true,
          has_booking_link: false,
          has_testimonials: true,
          has_pricing: true,
          has_whatsapp: true,
          has_cta: true,
          cta_examples: ["Request a Quote"],
        },
        buttons: [{ text: "Request a Quote", type: "button" }],
      }),
      expectedKey: "lead_capture_automation",
    },
    {
      name: "seo-content",
      extraction: baseExtraction({
        title: "Marketing Blog",
        body_text:
          "Long educational content ".repeat(60) + "with no clear pricing but a lot of search-friendly topics.",
        meta_description: "Deep guides and articles.",
        detected_signals: {
          has_contact_page: true,
          has_booking_link: false,
          has_testimonials: false,
          has_pricing: false,
          has_whatsapp: false,
          has_cta: true,
          cta_examples: ["Read More"],
        },
      }),
      expectedKey: "seo_content_system",
    },
    {
      name: "automation-ops",
      extraction: baseExtraction({
        title: "Software Studio",
        body_text: "We automate workflows, integrations, and operational systems for modern teams.",
        meta_description: "Automation and workflow systems for growing teams.",
        detected_signals: {
          has_contact_page: true,
          has_booking_link: false,
          has_testimonials: true,
          has_pricing: true,
          has_whatsapp: false,
          has_cta: true,
          cta_examples: ["Talk to Us"],
        },
      }),
      expectedKey: "ai_automation_ops",
    },
    {
      name: "policy-page",
      extraction: baseExtraction({
        title: "Privacy Policy",
        body_text: "This page explains how cookies and data are handled.",
        meta_description: "Privacy and cookie policy.",
      }),
      expectedKey: "website_conversion_audit",
      signalChecks: [
        ["contact_page", false],
        ["booking_link", false],
        ["testimonials", false],
        ["pricing", false],
        ["whatsapp", false],
        ["cta", false],
      ],
    },
    {
      name: "secondary-booking",
      extraction: baseExtraction({
        title: "Massage Studio",
        body_text: "Reserve your slot now and view service packages.",
        detected_signals: {
          has_contact_page: true,
          has_booking_link: true,
          has_testimonials: false,
          has_pricing: true,
          has_whatsapp: false,
          has_cta: true,
          cta_examples: ["Reserve Now"],
        },
      }),
      expectedKey: "booking_funnel_setup",
    },
  ];

  for (const fixture of fixtures) {
    const analysis = analyzeWebsiteRules(fixture.extraction);
    assert(
      analysis.recommendation.key === fixture.expectedKey,
      `${fixture.name}: expected ${fixture.expectedKey}, got ${analysis.recommendation.key}`,
    );
    assert(analysis.strengths.length + analysis.weaknesses.length > 0, `${fixture.name}: findings missing`);
    assert(analysis.evidence.length >= 9, `${fixture.name}: evidence set too small`);

    for (const [key, expected] of fixture.signalChecks ?? []) {
      const signal = analysis.evidence.find((item) => item.key === key);
      assert(signal, `${fixture.name}: missing signal evidence for ${key}`);
      assert(signal.present === expected, `${fixture.name}: signal mismatch for ${key}`);
    }
  }

  console.log(`RULES_SMOKE_OK:${fixtures.length}`);
}

run().catch((error) => {
  console.error(`RULES_SMOKE_FAIL:${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

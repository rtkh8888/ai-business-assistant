export const serviceTaxonomy = {
  website_conversion_audit: {
    label: "Website Conversion Audit",
    description: "For sites with weak CTAs, unclear offers, or poor conversion flow.",
  },
  copywriting_offer_positioning: {
    label: "Copywriting & Offer Positioning",
    description: "For sites with weak messaging, unclear positioning, or generic copy.",
  },
  lead_capture_automation: {
    label: "Lead Capture Automation",
    description: "For sites that need better forms, booking, chat, or intake routing.",
  },
  local_seo_optimization: {
    label: "Local SEO Optimization",
    description: "For local businesses that need map visibility and local search improvements.",
  },
  seo_content_system: {
    label: "SEO Content System",
    description: "For businesses that need organic traffic through content and search intent.",
  },
  review_reputation_system: {
    label: "Review & Reputation System",
    description: "For businesses with trust gaps that would benefit from reviews and testimonials.",
  },
  booking_funnel_setup: {
    label: "Booking Funnel Setup",
    description: "For businesses that need a smoother appointment or quote booking flow.",
  },
  ai_automation_ops: {
    label: "AI Automation Ops",
    description: "For businesses with repetitive intake, follow-up, or workflow tasks.",
  },
} as const;

export type ServiceTaxonomyKey = keyof typeof serviceTaxonomy;

export const serviceTaxonomyKeys = Object.keys(serviceTaxonomy) as ServiceTaxonomyKey[];

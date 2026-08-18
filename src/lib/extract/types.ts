export type ExtractionQuality = "good" | "partial" | "fallback";

export type ExtractedLink = {
  text: string;
  href: string;
};

export type ExtractedButton = {
  text: string;
  type: "button" | "submit" | "anchor";
  href?: string;
};

export type ExtractedForm = {
  action: string | null;
  method: string | null;
  inputNames: string[];
};

export type WebsiteExtractionResult = {
  input_url: string;
  final_url: string;
  canonical_url: string | null;
  title: string;
  meta_description: string;
  headings: string[];
  body_text: string;
  buttons: ExtractedButton[];
  links: ExtractedLink[];
  forms: ExtractedForm[];
  detected_signals: {
    has_contact_page: boolean;
    has_booking_link: boolean;
    has_testimonials: boolean;
    has_pricing: boolean;
    has_whatsapp: boolean;
    has_cta: boolean;
    cta_examples: string[];
  };
  extraction_quality: ExtractionQuality;
  needs_browser_rendering: boolean;
  fallback_reason: string | null;
};

export type WebsiteFetchOptions = {
  timeoutMs?: number;
  userAgent?: string;
};

export type BrowserFallbackRenderer = (url: string) => Promise<string | null>;

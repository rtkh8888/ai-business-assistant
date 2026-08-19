import type { WebsiteExtractionResult } from "@/lib/extract";
import type { ServiceTaxonomyKey } from "./taxonomy";

export type RuleEvidence = {
  key:
    | "contact_page"
    | "booking_link"
    | "booking_form"
    | "testimonials"
    | "pricing"
    | "whatsapp"
    | "cta"
    | "sparse_content"
    | "js_heavy"
    | "local_business";
  present: boolean;
  confidence: number;
  details: string;
};

export type RuleBasedRecommendation = {
  key: ServiceTaxonomyKey;
  label: string;
  reason: string;
};

export type RuleBasedAnalysis = {
  analysis_version: "v1";
  rule_version: "v1";
  input_url: string;
  final_url: string;
  business_name: string;
  extracted_summary: string;
  strengths: string[];
  weaknesses: string[];
  evidence: RuleEvidence[];
  recommendation: RuleBasedRecommendation;
  notes: string[];
};

export type RuleAnalysisInput = WebsiteExtractionResult;

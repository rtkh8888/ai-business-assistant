export const leadStatuses = [
  "new",
  "reviewed",
  "ready",
  "contacted",
  "replied",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export type Lead = {
  id: string;
  original_url: string;
  normalized_url: string;
  canonical_url: string | null;
  website_host: string;
  business_name: string;
  industry: string;
  target_customer: string;
  business_summary: string;
  strengths: string[];
  weaknesses: string[];
  recommended_service_key: string;
  recommended_service_label: string;
  recommended_service_reason: string;
  outreach_message: string;
  opportunity_score: number;
  score_explanation: string;
  status: LeadStatus;
  last_analysis_id: string | null;
  reviewed_at: string | null;
  contacted_at: string | null;
  replied_at: string | null;
  won_at: string | null;
  lost_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadAnalysis = {
  id: string;
  lead_id: string;
  analysis_status: "processing" | "succeeded" | "failed";
  analysis_version: string;
  prompt_version: string;
  model_provider: string;
  model_name: string;
  input_url: string;
  extraction_json: Record<string, unknown>;
  rule_findings_json: Record<string, unknown>;
  llm_output_json: Record<string, unknown>;
  score: number;
  score_explanation: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadInsert = Omit<Lead, "id" | "created_at" | "updated_at">;
export type LeadUpdate = Partial<Omit<Lead, "id" | "created_at" | "updated_at">>;

export type LeadAnalysisInsert = Omit<LeadAnalysis, "id" | "created_at" | "updated_at">;

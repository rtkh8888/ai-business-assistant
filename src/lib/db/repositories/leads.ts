import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Lead,
  LeadAnalysis,
  LeadAnalysisInsert,
  LeadInsert,
  LeadStatus,
  LeadUpdate,
} from "@/lib/db/types";

const leadSelect = `
  id,
  original_url,
  normalized_url,
  canonical_url,
  website_host,
  business_name,
  industry,
  target_customer,
  business_summary,
  strengths,
  weaknesses,
  recommended_service_key,
  recommended_service_label,
  recommended_service_reason,
  outreach_message,
  opportunity_score,
  score_explanation,
  status,
  last_analysis_id,
  reviewed_at,
  contacted_at,
  replied_at,
  won_at,
  lost_at,
  created_at,
  updated_at
`;

const analysisSelect = `
  id,
  lead_id,
  analysis_status,
  analysis_version,
  prompt_version,
  model_provider,
  model_name,
  input_url,
  extraction_json,
  rule_findings_json,
  llm_output_json,
  score,
  score_explanation,
  error_message,
  created_at,
  updated_at
`;

export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("leads").select(leadSelect).eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch lead: ${error.message}`);
  }

  return data as Lead | null;
}

export async function getLeadByNormalizedUrl(normalizedUrl: string): Promise<Lead | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select(leadSelect)
    .eq("normalized_url", normalizedUrl)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch lead by URL: ${error.message}`);
  }

  return data as Lead | null;
}

export async function listLeads(): Promise<Lead[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select(leadSelect)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list leads: ${error.message}`);
  }

  return (data ?? []) as Lead[];
}

export async function insertLead(payload: LeadInsert): Promise<Lead> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("leads").insert(payload).select(leadSelect).single();

  if (error) {
    throw new Error(`Failed to insert lead: ${error.message}`);
  }

  return data as Lead;
}

export async function updateLead(id: string, payload: LeadUpdate): Promise<Lead> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .update(payload)
    .eq("id", id)
    .select(leadSelect)
    .single();

  if (error) {
    throw new Error(`Failed to update lead: ${error.message}`);
  }

  return data as Lead;
}

export async function deleteLead(id: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete lead: ${error.message}`);
  }
}

export async function insertLeadAnalysis(payload: LeadAnalysisInsert): Promise<LeadAnalysis> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lead_analyses")
    .insert(payload)
    .select(analysisSelect)
    .single();

  if (error) {
    throw new Error(`Failed to insert lead analysis: ${error.message}`);
  }

  return data as LeadAnalysis;
}

export async function listLeadAnalyses(leadId: string): Promise<LeadAnalysis[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lead_analyses")
    .select(analysisSelect)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list lead analyses: ${error.message}`);
  }

  return (data ?? []) as LeadAnalysis[];
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  timestamps: Partial<
    Pick<Lead, "reviewed_at" | "contacted_at" | "replied_at" | "won_at" | "lost_at">
  > = {},
): Promise<Lead> {
  return updateLead(id, {
    status,
    ...timestamps,
  });
}

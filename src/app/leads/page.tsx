import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { hasSupabaseEnv } from "@/lib/env";
import { listLeads, type Lead } from "@/lib/db";

const fallbackLeads: Lead[] = [
  {
    id: "sample-1",
    original_url: "https://example.com",
    normalized_url: "https://example.com",
    canonical_url: "https://example.com",
    website_host: "example.com",
    business_name: "Example Business",
    industry: "Unknown",
    target_customer: "Unknown",
    business_summary: "Sample lead record for the Phase 2 skeleton.",
    strengths: ["Clear site structure"],
    weaknesses: ["Needs real analysis"],
    recommended_service_key: "website_conversion_audit",
    recommended_service_label: "Website Conversion Audit",
    recommended_service_reason: "Sample recommendation for UI review.",
    outreach_message: "Sample outreach draft.",
    opportunity_score: 62,
    score_explanation: "Sample seeded lead.",
    status: "new",
    last_analysis_id: null,
    reviewed_at: null,
    contacted_at: null,
    replied_at: null,
    won_at: null,
    lost_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function statusTone(status: Lead["status"]) {
  switch (status) {
    case "new":
      return "neutral";
    case "reviewed":
    case "ready":
      return "warning";
    case "lost":
      return "danger";
    default:
      return "success";
  }
}

export default async function LeadsPage() {
  let leads: Lead[] = fallbackLeads;
  let source = "sample data";
  let errorMessage: string | null = null;

  if (hasSupabaseEnv()) {
    try {
      leads = await listLeads();
      source = "Supabase";
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Failed to load leads.";
    }
  }

  return (
    <main>
      <div className="shell">
        <section className="hero">
          <div className="hero-topline">
            <p className="eyebrow">Lead list</p>
            <Link className="button button-secondary" href="/">
              Back to input
            </Link>
          </div>
          <h1 className="title">Leads dashboard skeleton</h1>
          <p className="lede">
            This page is ready for search, filters, detail views, and status management in later
            phases.
          </p>
          <div className="status-chip status-chip-muted">Data source: {source}</div>
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        </section>

        <section className="card">
          <div className="toolbar">
            <label className="field compact">
              <span className="field-label">Search</span>
              <input className="input" placeholder="Search by business name or URL" type="text" />
            </label>
            <label className="field compact">
              <span className="field-label">Status</span>
              <select className="input" defaultValue="">
                <option value="">All statuses</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="ready">Ready</option>
                <option value="contacted">Contacted</option>
                <option value="replied">Replied</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </label>
            <label className="field compact">
              <span className="field-label">Score</span>
              <select className="input" defaultValue="">
                <option value="">Any score</option>
                <option value="high">80+</option>
                <option value="mid">50-79</option>
                <option value="low">&lt; 50</option>
              </select>
            </label>
          </div>
        </section>

        <section className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Recommended service</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <strong>{lead.business_name}</strong>
                      <div className="subtle">{lead.industry}</div>
                    </td>
                    <td className="mono">{lead.normalized_url}</td>
                    <td>
                      <StatusBadge label={lead.status} tone={statusTone(lead.status)} />
                    </td>
                    <td>{lead.opportunity_score}</td>
                    <td>{lead.recommended_service_label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h2>Lead detail entry point</h2>
          <p>
            Phase 9 will expand each row into a full detail view with status transitions, score
            filters, and persistent edits.
          </p>
        </section>
      </div>
    </main>
  );
}


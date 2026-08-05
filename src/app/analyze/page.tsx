import Link from "next/link";

type AnalyzePageProps = {
  searchParams?: Promise<{
    website?: string | string[];
  }>;
};

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function AnalyzePage({ searchParams }: AnalyzePageProps) {
  const params = (await searchParams) ?? {};
  const websiteValue = Array.isArray(params.website) ? params.website[0] : params.website;
  const website = websiteValue ? safeDecode(websiteValue) : null;

  return (
    <main>
      <div className="shell">
        <section className="hero">
          <div className="hero-topline">
            <p className="eyebrow">Results layout</p>
            <Link className="button button-secondary" href="/">
              Back to input
            </Link>
          </div>
          <h1 className="title">Analysis workspace</h1>
          <p className="lede">
            This screen is the structured placeholder for analysis output. Phase 3+ will replace
            these panels with extracted content, rules, scoring, and LLM output.
          </p>
          <div className="status-chip status-chip-muted">
            {website ? `Prepared for ${website}` : "No website selected yet"}
          </div>
        </section>

        <section className="grid">
          <article className="card half">
            <h2>Business snapshot</h2>
            <dl className="summary-grid">
              <div>
                <dt>Business name</dt>
                <dd>Unknown</dd>
              </div>
              <div>
                <dt>Industry</dt>
                <dd>Unknown</dd>
              </div>
              <div>
                <dt>Target customer</dt>
                <dd>Unknown</dd>
              </div>
              <div>
                <dt>Canonical URL</dt>
                <dd className="mono">{website ?? "Not provided"}</dd>
              </div>
            </dl>
          </article>

          <article className="card half">
            <h2>Opportunity score</h2>
            <div className="score-meter">
              <span className="score-value">--</span>
              <div>
                <p className="score-label">Score will appear after analysis</p>
                <p className="form-hint">This card is reserved for the scoring output.</p>
              </div>
            </div>
          </article>

          <article className="card half">
            <h2>Weaknesses</h2>
            <ul>
              <li>Pending extraction</li>
              <li>Pending rule-based analysis</li>
              <li>Pending LLM review</li>
            </ul>
          </article>

          <article className="card half">
            <h2>Recommended service</h2>
            <p className="mono">Pending analysis</p>
            <p className="form-hint">
              The architecture locks this to a controlled service taxonomy once analysis is added.
            </p>
          </article>

          <article className="card">
            <h2>Outreach draft</h2>
            <textarea
              className="textarea"
              defaultValue="The outreach editor will appear here once Phase 5 and Phase 7 are implemented."
              readOnly
              rows={6}
            />
            <div className="form-actions">
              <button className="button button-primary" disabled type="button">
                Save changes
              </button>
              <button className="button button-secondary" disabled type="button">
                Regenerate draft
              </button>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}


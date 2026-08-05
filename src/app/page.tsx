import Link from "next/link";
import { UrlAnalysisForm } from "@/components/url-analysis-form";
import { getEnvStatus } from "@/lib/env";

export default function HomePage() {
  const envStatus = getEnvStatus();

  return (
    <main>
      <div className="shell">
        <section className="hero">
          <div className="hero-topline">
            <p className="eyebrow">Phase 2 UI skeleton</p>
            <span className="status-chip">Human review only</span>
          </div>
          <h1 className="title">AI Business Research & Outreach Assistant</h1>
          <p className="lede">
            A Next.js + Supabase MVP for researching one business website at a time, storing
            structured analyses, and keeping the current lead snapshot separate from analysis
            history.
          </p>
          <div className="status">{envStatus.message}</div>
          <div className="hero-links">
            <Link className="button button-secondary" href="/leads">
              Open lead list
            </Link>
            <Link className="button button-secondary" href="/analyze">
              View analysis layout
            </Link>
          </div>
        </section>

        <section className="grid">
          <article className="card half">
            <h2>Website URL input</h2>
            <p>
              The form validates user input, normalizes missing schemes, and routes to the analysis
              workspace.
            </p>
            <UrlAnalysisForm />
          </article>

          <article className="card half">
            <h2>Navigation</h2>
            <ul>
              <li>Landing page with analysis input</li>
              <li>Lead list page for review and triage</li>
              <li>Analysis workspace with structured placeholder panels</li>
            </ul>
          </article>

          <article className="card">
            <h2>Phase 2 deliverables</h2>
            <ul className="pill-list">
              <li className="pill">Landing page</li>
              <li className="pill">URL input</li>
              <li className="pill">Analyse button</li>
              <li className="pill">Results layout</li>
              <li className="pill">Lead list page</li>
              <li className="pill">Loading state</li>
              <li className="pill">Error handling</li>
            </ul>
          </article>

          <article className="card">
            <h2>Implementation note</h2>
            <p>
              This phase is intentionally visual and navigational. It does not yet perform website
              extraction, scoring, or LLM analysis.
            </p>
            <p className="mono">Workspace status: ready for Phase 3</p>
          </article>
        </section>
      </div>
    </main>
  );
}


import { getEnvStatus } from "@/lib/env";

export default function HomePage() {
  const envStatus = getEnvStatus();

  return (
    <main>
      <div className="shell">
        <section className="hero">
          <p className="eyebrow">Phase 0 and Phase 1 scaffold</p>
          <h1 className="title">AI Business Research & Outreach Assistant</h1>
          <p className="lede">
            A Next.js + Supabase MVP for researching one business website at a time, storing
            structured analyses, and keeping the current lead snapshot separate from analysis
            history.
          </p>
          <div className="status">{envStatus.message}</div>
        </section>

        <section className="grid">
          <article className="card half">
            <h2>What is wired now</h2>
            <ul>
              <li>Next.js App Router scaffold</li>
              <li>TypeScript and linting config</li>
              <li>Supabase environment shape</li>
              <li>Database schema and seed SQL</li>
              <li>Lead repository layer</li>
            </ul>
          </article>

          <article className="card half">
            <h2>Architecture choices</h2>
            <ul>
              <li>Separate `lead_analyses` history table</li>
              <li>Mutable current snapshot in `leads`</li>
              <li>Lazy env validation so local builds do not fail without secrets</li>
            </ul>
          </article>

          <article className="card">
            <h2>Configured schema highlights</h2>
            <ul className="pill-list">
              <li className="pill">lead_status enum</li>
              <li className="pill">normalized_url unique</li>
              <li className="pill">JSONB strengths / weaknesses</li>
              <li className="pill">analysis history</li>
              <li className="pill">timestamped status changes</li>
            </ul>
          </article>

          <article className="card">
            <h2>Next step</h2>
            <p>
              With Phase 0 and 1 in place, we can move into UI skeleton work knowing the storage
              model and repository API are already locked.
            </p>
            <p className="mono">Workspace status: ready for Phase 2 planning</p>
          </article>
        </section>
      </div>
    </main>
  );
}

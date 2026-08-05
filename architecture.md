# Architecture

## 1. Purpose

This document is the source of truth for the MVP architecture of the AI Business Research & Outreach Assistant.

Goals:
- Accept one business website URL at a time.
- Extract useful website content.
- Apply deterministic rules and LLM analysis.
- Generate a structured business assessment, opportunity score, service recommendation, and outreach draft.
- Store results for human review and lead management.

Non-goals for the MVP:
- No multi-agent orchestration.
- No automatic outreach or email sending.
- No bulk import.
- No CRM integration.
- No enterprise workflow engine or queue infrastructure.

---

## 2. Overall System Architecture

The system uses a simple Next.js application with Supabase Postgres as the persistence layer.

### Request flow

1. User submits a website URL from the UI.
2. The app normalizes the URL and checks whether the lead already exists.
3. The website extraction service fetches and parses the homepage.
4. The rules engine derives deterministic findings from extracted content.
5. The LLM analysis engine produces structured JSON.
6. The scoring engine combines rule-based and LLM signals into a 0-100 opportunity score.
7. The persistence layer stores the analysis run and updates the lead record.
8. The UI displays the results and allows manual editing and status updates.

### Runtime shape

- Frontend: Next.js App Router.
- Backend: Next.js route handlers / server actions.
- Database: Supabase Postgres.
- Validation: Zod schemas at runtime.
- LLM access: provider abstraction with a single interface.
- Extraction: HTTP fetch first, browser-rendered fallback only when needed.

### Operational model

- One analysis pipeline runs per submitted website.
- Processing is synchronous from a product perspective, but the UI may poll the server for analysis completion if needed.
- The design favors simplicity over queue-based processing.

---

## 3. Database Schema

### Decision

Analysis is stored in a separate table.

Reason:
- We need an immutable history of each analysis run.
- Leads should keep the current editable snapshot for fast dashboard reads.
- Re-analysis should not overwrite the audit trail.

JSONB is used for structured subdocuments and arrays, not as the primary storage mechanism for the lead record itself.

### Enum: `lead_status`

Allowed values:
- `new`
- `reviewed`
- `ready`
- `contacted`
- `replied`
- `won`
- `lost`

### Table: `leads`

Current lead snapshot and dashboard record.

Fields:
- `id` uuid primary key, default `gen_random_uuid()`
- `original_url` text not null
- `normalized_url` text not null unique
- `canonical_url` text null
- `website_host` text not null
- `business_name` text not null default `'Unknown'`
- `industry` text not null default `'Unknown'`
- `target_customer` text not null default `'Unknown'`
- `business_summary` text not null default `'Unknown'`
- `strengths` jsonb not null default `'[]'`
- `weaknesses` jsonb not null default `'[]'`
- `recommended_service_key` text not null default `'unknown'`
- `recommended_service_label` text not null default `'Unknown'`
- `recommended_service_reason` text not null default `'Unknown'`
- `outreach_message` text not null default `'Unknown'`
- `opportunity_score` integer not null default `0`
- `score_explanation` text not null default `'Unknown'`
- `status` `lead_status` not null default `new`
- `last_analysis_id` uuid null references `lead_analyses(id)`
- `reviewed_at` timestamptz null
- `contacted_at` timestamptz null
- `replied_at` timestamptz null
- `won_at` timestamptz null
- `lost_at` timestamptz null
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

Indexes:
- unique index on `normalized_url`
- index on `status`
- index on `opportunity_score`
- index on `updated_at`

### Table: `lead_analyses`

Immutable history of every analysis run.

Fields:
- `id` uuid primary key, default `gen_random_uuid()`
- `lead_id` uuid not null references `leads(id)` on delete cascade
- `analysis_status` text not null
  - allowed values: `processing`, `succeeded`, `failed`
- `analysis_version` text not null default `'v1'`
- `prompt_version` text not null default `'v1'`
- `model_provider` text not null
- `model_name` text not null
- `input_url` text not null
- `extraction_json` jsonb not null
- `rule_findings_json` jsonb not null
- `llm_output_json` jsonb not null
- `score` integer not null default `0`
- `score_explanation` text not null default `'Unknown'`
- `error_message` text null
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

Indexes:
- index on `lead_id`
- index on `analysis_status`
- index on `created_at`

### Table responsibilities

- `leads` is the mutable current-state view.
- `lead_analyses` is the immutable run history and debug trail.

---

## 4. LLM Output JSON Schema

The LLM must return a single JSON object that matches this exact schema.

### Required fields

- `business_name` string
- `industry` string
- `target_customer` string
- `business_summary` string
- `strengths` string[]
- `weaknesses` string[]
- `recommended_service_key` string
- `recommended_service_label` string
- `recommended_service_reason` string
- `outreach_message` string

### Optional fields

- `confidence` number
- `website_signals` object
- `notes` string

### Exact shape

```json
{
  "business_name": "string",
  "industry": "string",
  "target_customer": "string",
  "business_summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommended_service_key": "string",
  "recommended_service_label": "string",
  "recommended_service_reason": "string",
  "outreach_message": "string",
  "confidence": 0.0,
  "website_signals": {
    "has_contact_page": true,
    "has_booking_link": true,
    "has_testimonials": true,
    "has_pricing": true,
    "has_whatsapp": true,
    "cta_examples": ["string"]
  },
  "notes": "string"
}
```

### Required semantics

- `strengths` and `weaknesses` must always be arrays, even when empty.
- `recommended_service_key` must always be one of the approved service taxonomy keys.
- `outreach_message` must be direct, personalized, and suitable for human review.
- The model must not invent facts not supported by the extracted content unless clearly labeled as a cautious inference.

---

## 5. Required and Optional Fields

### Lead record fields

Required for persistence:
- `original_url`
- `normalized_url`
- `website_host`
- `business_name`
- `industry`
- `target_customer`
- `business_summary`
- `strengths`
- `weaknesses`
- `recommended_service_key`
- `recommended_service_label`
- `recommended_service_reason`
- `outreach_message`
- `opportunity_score`
- `score_explanation`
- `status`

Optional:
- `canonical_url`
- `last_analysis_id`
- `reviewed_at`
- `contacted_at`
- `replied_at`
- `won_at`
- `lost_at`

### Analysis record fields

Required:
- `lead_id`
- `analysis_status`
- `analysis_version`
- `prompt_version`
- `model_provider`
- `model_name`
- `input_url`
- `extraction_json`
- `rule_findings_json`
- `llm_output_json`
- `score`
- `score_explanation`

Optional:
- `error_message`

---

## 6. Fallback Values

Allowed fallback values are intentionally narrow.

### Text fields

When the value cannot be determined:
- use `"Unknown"` for descriptive text fields
- use `"unknown"` for machine-oriented keys only when required by schema

Examples:
- `business_name = "Unknown"`
- `industry = "Unknown"`
- `target_customer = "Unknown"`
- `recommended_service_label = "Unknown"`
- `recommended_service_reason = "Unknown"`
- `score_explanation = "Unknown"`

### Arrays

When no items are available:
- use `[]`

Applies to:
- `strengths`
- `weaknesses`
- `website_signals.cta_examples`

### Numbers

When a score or confidence cannot be computed:
- use `0` for `opportunity_score`
- use `0.0` for `confidence`

### URLs

When no canonical URL is discoverable:
- leave `canonical_url` null

---

## 7. Validation Rules and Retry Behaviour

### Validation layers

1. URL validation before any network call.
2. Extraction shape validation after parsing.
3. Rule output validation.
4. LLM JSON validation with Zod.
5. Database constraint validation on save.

### LLM retry policy

- Maximum retries for malformed JSON: 2
- Retry only when the response is structurally invalid, truncated, or missing required fields.
- Do not retry if the provider returns an authentication, quota, or hard rate-limit error.
- On retry, resend the schema instructions and the previous invalid output summary.

### Repair strategy

If the model returns JSON that is almost valid:
- attempt a single JSON repair pass
- then validate again
- if still invalid, retry the LLM call

### Failure handling

If analysis cannot complete:
- persist the lead if URL and extraction succeeded enough to create a record
- set `analysis_status = failed`
- populate `error_message`
- keep partial extraction and rule findings if available
- never silently drop the request

### Safety constraints

- Reject non-HTTP(S) URLs.
- Reject empty hostnames.
- Reject malformed URLs before attempting extraction.
- Never allow free-form text to bypass schema validation.

---

## 8. Service / Recommendation Taxonomy

The system must recommend exactly one service key from this controlled catalog.

### Approved services

- `website_conversion_audit`
  - For sites with weak CTAs, unclear offer, or poor conversion flow.
- `copywriting_offer_positioning`
  - For sites with weak messaging, unclear positioning, or generic copy.
- `lead_capture_automation`
  - For sites that need forms, booking, chat, or CRM-connected intake.
- `local_seo_optimization`
  - For local businesses that need map visibility, local landing pages, or GBP improvements.
- `seo_content_system`
  - For businesses that need organic traffic through content and search intent targeting.
- `review_reputation_system`
  - For businesses with trust gaps that would benefit from testimonials and review generation.
- `booking_funnel_setup`
  - For businesses that need a smoother appointment or quote booking flow.
- `ai_automation_ops`
  - For businesses with repetitive manual intake, follow-up, or internal workflow tasks.

### Recommendation rules

- Exactly one service must be selected.
- The recommendation should be the highest-leverage near-term improvement.
- The recommendation should fit the observed evidence from the site.
- If multiple services are plausible, choose the one that improves conversions first.

### Output mapping

- `recommended_service_key` must match one approved key.
- `recommended_service_label` must be the human-readable label for that key.
- `recommended_service_reason` must explain why that service fits the observed gaps.

---

## 9. Lead Status Flow

### Status meanings

- `new`: lead created, not yet reviewed by a human.
- `reviewed`: analysis reviewed manually.
- `ready`: approved and ready for manual outreach.
- `contacted`: outreach has been sent manually by a human.
- `replied`: the prospect responded.
- `won`: converted into a customer.
- `lost`: closed without conversion.

### Allowed transitions

- `new` -> `reviewed`
- `new` -> `ready`
- `new` -> `lost`
- `reviewed` -> `ready`
- `reviewed` -> `contacted`
- `reviewed` -> `lost`
- `ready` -> `contacted`
- `ready` -> `lost`
- `contacted` -> `replied`
- `contacted` -> `won`
- `contacted` -> `lost`
- `replied` -> `contacted` only if another manual outreach is sent
- `replied` -> `won`
- `replied` -> `lost`

### Terminal states

- `won`
- `lost`

No transition out of a terminal state is allowed in the MVP.

### Timestamp rules

- Set `reviewed_at` when moving into `reviewed`.
- Set `contacted_at` when moving into `contacted`.
- Set `replied_at` when moving into `replied`.
- Set `won_at` when moving into `won`.
- Set `lost_at` when moving into `lost`.

---

## 10. URL Normalization Rules

Duplicate detection depends on a stable normalized URL.

### Normalization steps

1. Trim whitespace.
2. If the scheme is missing, prepend `https://`.
3. Parse the URL.
4. Reject non-HTTP(S) schemes.
5. Lower-case the hostname.
6. Remove leading `www.` from the hostname.
7. Remove default ports `:80` and `:443`.
8. Remove fragment identifiers.
9. Remove tracking query parameters such as:
   - `utm_source`
   - `utm_medium`
   - `utm_campaign`
   - `utm_term`
   - `utm_content`
   - `gclid`
   - `fbclid`
10. Normalize repeated slashes in the path.
11. Remove a trailing slash from non-root paths.
12. Preserve the path if the user explicitly provided a non-root page.

### Canonical URL handling

- Follow redirects and store the final resolved URL in `canonical_url` when available.
- If the site provides a clear canonical homepage, prefer that for deduplication.
- Use `normalized_url` as the database uniqueness key.

### Duplicate detection

- If an existing lead already matches the normalized URL, reuse that lead.
- Create a new analysis record instead of duplicating the lead.

---

## 11. Website Extraction Strategy

The extraction pipeline is optimized for speed and low operational cost.

### Step 1: Fetch homepage HTML

- Use a standard HTTP client first.
- Follow redirects.
- Use a short timeout.
- Send a normal browser-like user agent.
- Request only the homepage for the MVP.

### Step 2: Parse and clean HTML

Extract:
- document title
- meta description
- headings `h1` through `h3`
- body text
- buttons
- forms
- links
- contact references
- pricing references
- testimonial references
- booking references
- WhatsApp references

Clean:
- navigation menus
- footers
- cookie banners
- repetitive boilerplate
- script/style content
- obvious template noise

### Step 3: Judge whether browser rendering is needed

Trigger fallback rendering when:
- extracted text is too sparse
- the HTML is mostly script-driven
- the page looks like a SPA or hydration shell
- the DOM contains strong client-side rendering signals

### Step 4: Browser fallback

- Use a headless browser only when needed.
- Wait for network idle or a short render timeout.
- Re-extract the same structured fields from the rendered DOM.
- Do not attempt multi-page crawling in the MVP.

### Step 5: Partial failure handling

If the browser fallback fails:
- keep the HTTP extraction result if usable
- mark the extraction as partial
- continue to rule-based analysis and LLM analysis if enough text exists
- fail the overall pipeline only when there is insufficient content for a meaningful analysis

### Extraction output shape

The extraction result should be a structured object containing at least:
- `final_url`
- `title`
- `meta_description`
- `headings`
- `body_text`
- `buttons`
- `links`
- `forms`
- `detected_signals`
- `extraction_quality`

---

## 12. Core Modules and Responsibilities

### `app/`

- UI routes and server entry points.
- Landing page, lead detail page, lead list page, and analysis trigger endpoint.

### `lib/url`

- URL parsing, normalization, canonicalization, and dedupe key generation.

### `lib/extract`

- Fetches HTML.
- Parses and cleans content.
- Detects when to use browser fallback.
- Returns structured extraction output.

### `lib/rules`

- Deterministic signal detection.
- Identifies WhatsApp links, booking links, contact pages, testimonials, pricing, and CTA patterns.

### `lib/llm`

- Provider abstraction.
- Prompt assembly.
- JSON schema enforcement.
- Retry and repair logic.

### `lib/scoring`

- Produces the 0-100 opportunity score.
- Combines deterministic and LLM-derived signals.
- Generates score explanation.

### `lib/services`

- Houses the service taxonomy.
- Maps signals to approved recommendation keys.

### `lib/db`

- Supabase client.
- Repository functions.
- Lead persistence.
- Analysis persistence.

### `lib/validation`

- Shared Zod schemas for URLs, extraction, rules, LLM output, and database writes.

### `components/`

- Presentation components for the dashboard, forms, cards, and status controls.

---

## 13. Key Architecture Decisions and Tradeoffs

### Separate analysis table

Decision:
- Store analysis runs in `lead_analyses`.

Tradeoff:
- Slightly more schema complexity.
- Much better traceability and re-analysis support.

### Denormalized current lead snapshot

Decision:
- Keep the latest useful output on `leads`.

Tradeoff:
- Some duplication between `leads` and `lead_analyses`.
- Faster list and detail views.

### JSONB for structured subdocuments

Decision:
- Use JSONB for extraction snapshots, rule findings, strengths, and weaknesses.

Tradeoff:
- Less relational rigidity.
- Easier to evolve the schema during the MVP.

### HTTP-first extraction with browser fallback

Decision:
- Prefer fast HTML fetches and only render with a browser when needed.

Tradeoff:
- Misses some dynamic content in the first pass.
- Keeps cost and complexity much lower than always using Playwright.

### Controlled service taxonomy

Decision:
- Limit recommendations to a small fixed list of services.

Tradeoff:
- Less flexible than free-form recommendations.
- Produces more consistent, actionable output.

### Strict validation and bounded retries

Decision:
- Validate every major boundary and retry only a small number of times.

Tradeoff:
- Some edge cases will fail rather than be guessed.
- The system stays predictable and debuggable.

### Human-in-the-loop only

Decision:
- No automatic outreach.

Tradeoff:
- Slower downstream execution.
- Safer and better aligned with the MVP.

